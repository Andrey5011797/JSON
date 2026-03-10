let userNameField = document.querySelector("#userNameField");
let ageField = document.querySelector("#ageField");
let studentCheckbox = document.querySelector("#studentCheckbox");
let cityField = document.querySelector("#cityField");
let groupField = document.querySelector("#groupField");
let emailField = document.querySelector("#emailField");
let tagsField = document.querySelector("#tagsField");
let profileForm = document.querySelector("#profileForm");
let exportResultArea = document.querySelector("#exportResultArea");
let importSourceArea = document.querySelector("#importSourceArea");
let importedDataDisplay = document.querySelector("#importedDataDisplay");
let errorContainer = document.querySelector("#errorContainer");
let errorDescription = document.querySelector("#errorDescription");
let spacingDropdown = document.querySelector("#spacingDropdown");
let keyCheckboxes = document.querySelectorAll(".keyCheckbox");
let simpleExportBtn = document.querySelector("#simpleExportBtn");
let filteredExportBtn = document.querySelector("#filteredExportBtn");
let functionExportBtn = document.querySelector("#functionExportBtn");
let startImportBtn = document.querySelector("#startImportBtn");

let currentProfileData = null; //объект профиля
let idCounter = 1; //счётчик для ид

function createProfileObject() { //все значения в объект js
  const newProfile = {
    id: idCounter++,
    userName: userNameField.value.trim() || "Без имени", //пробелы по бокам
    age: ageField.value.trim() || "0",
    isStudent: studentCheckbox.checked,
    tags: tagsField.value.split(',').map(tag => tag.trim()).filter(tag => tag !== ""),
    profile: {
      city: cityField.value.trim() || "Не указан",
      group: groupField.value.trim() || "Не указана",
      contacts: {
        email: emailField.value.trim() || "Не указан"
      }
    },
    createdAt: new Date() //объект Date
  };
  return newProfile;
}
function logUpdate() {
  console.log("Объект обновлён");
}
profileForm.addEventListener("submit", (event) => {
  event.preventDefault(); //нет перезапуска
  currentProfileData = createProfileObject();
  logUpdate();
  exportResultArea.value = "Объект собран";
  importedDataDisplay.textContent = JSON.stringify(currentProfileData, null, 2);
});

//export
function doSimpleExport() {
  if (!currentProfileData) {
    currentProfileData = createProfileObject();
  }
  const spacesCount = parseInt(spacingDropdown.value); //пробелы
  exportResultArea.value = JSON.stringify(currentProfileData, null, spacesCount);
  logUpdate();
}
function doFilteredExport() {
  if (!currentProfileData) {
    currentProfileData = createProfileObject();
  }
  const selectedKeys = Array.from(keyCheckboxes) //коллекция в массив
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  const spacesCount = parseInt(spacingDropdown.value);
  exportResultArea.value = JSON.stringify(currentProfileData, selectedKeys, spacesCount);
  logUpdate();
}
function doAdvancedExport() {
  if (!currentProfileData) {
    currentProfileData = createProfileObject();
  }
  const spacesCount = parseInt(spacingDropdown.value);
  function customReplacer(key, value) {
    if (key === "") {
      console.log("Корень", value);
      return value;
    }
    if (key === "age") {
      const numberValue = Number(value);
      return isNaN(numberValue) ? 0 : numberValue;
    }
    if (key="tags" && typeof value === "Строка"){
      return value.split(',').map(tag => tag.trim()).filter(tag => tag !== "");
    }
    if (key === "Контакты") {
      return undefined;
    }
    return value;
  }
  exportResultArea.value = JSON.stringify(currentProfileData, customReplacer, spacesCount);
  logUpdate();
}
//импорт
function importFromJson() {
  try {
    const jsonText = importSourceArea.value.trim();
    if (!jsonText) {
      throw new Error("Пустой JSON");
    }
    const parsedObject = JSON.parse(jsonText);

    if (parsedObject.createdAt && typeof parsedObject.createdAt === "string") {
      parsedObject.createdAt = new Date(parsedObject.createdAt);
    }
    fillFormWithObject(parsedObject);
    currentProfileData = parsedObject;
    importedDataDisplay.textContent = JSON.stringify(parsedObject, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString() + " (Объект даты)";
      }
      return value;
    }, 2);
    errorContainer.style.display = "none";
  } catch (error) {
    errorDescription.textContent = `Недопустимый JSON: ${error.message}`;
    errorContainer.style.display = "block";
  }
}

//заполнение
function fillFormWithObject(sourceObject) {
  if (sourceObject.userName !== undefined) userNameField.value = sourceObject.userName;
  if (sourceObject.age !== undefined) ageField.value = sourceObject.age;
  if (sourceObject.isStudent !== undefined) studentCheckbox.checked = sourceObject.isStudent;
  if (sourceObject.profile) {
    if (sourceObject.profile.city !== undefined) cityField.value = sourceObject.profile.city;
    if (sourceObject.profile.group !== undefined) groupField.value = sourceObject.profile.group;
    if (sourceObject.profile.contacts && sourceObject.profile.contacts.email !== undefined) {
      emailField.value = sourceObject.profile.contacts.email;
    }
  }
  if (sourceObject.tags !== undefined) {
    if (Array.isArray(sourceObject.tags)) {
      tagsField.value = sourceObject.tags.join(', ');
    } else {
      tagsField.value = sourceObject.tags;
    }
  }
  logUpdate();
}
simpleExportBtn.addEventListener("click", doSimpleExport);
filteredExportBtn.addEventListener("click", doFilteredExport);
functionExportBtn.addEventListener("click", doAdvancedExport);
startImportBtn.addEventListener("click", importFromJson);
currentProfileData = createProfileObject();
logUpdate();