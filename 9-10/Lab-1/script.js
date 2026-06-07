const API_URL = "https://jsonplaceholder.typicode.com/users";
const button = document.getElementById("getUsersBtn");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const container = document.getElementById("usersContainer");
const countEl = document.getElementById("count");

button.addEventListener("click", getUsers);
async function getUsers() {
  container.replaceChildren();
  errorBox.classList.add("hidden");
  countEl.textContent = "";
  loader.classList.remove("hidden");
  button.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    const users = await response.json();

    renderUsers(users);
    countEl.textContent = "Завантажено: " + users.length;
  } catch (err) {
    console.error("Не вдалося завантажити користувачів:", err);
    errorBox.textContent = "Failed to load users";
    errorBox.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
    button.disabled = false;
  }
}

function renderUsers(users) {
  users.forEach(function (user) {
    const card = document.createElement("div");
    card.className = "user-card";

    const name = document.createElement("h2");
    name.className = "user-name";
    name.textContent = user.name;

    function makeRow(label, value, extraClass) {
      const row = document.createElement("div");
      row.className = "user-row";

      const labelEl = document.createElement("span");
      labelEl.className = "user-label";
      labelEl.textContent = label;

      const valueEl = document.createElement("span");
      valueEl.className = "user-value" + (extraClass ? " " + extraClass : "");
      valueEl.textContent = value;

      row.append(labelEl, valueEl);
      return row;
    }

    const emailRow = makeRow("Email", user.email);
    const phoneRow = makeRow("Телефон", user.phone);
    const companyRow = makeRow("Компанія", user.company.name, "company");

    card.append(name, emailRow, phoneRow, companyRow);
    container.append(card);
  });
}
