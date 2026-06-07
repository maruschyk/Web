const BASE_URL = "https://dummyjson.com/users";

const getUsersBtn = document.getElementById("getUsersBtn");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const createForm = document.getElementById("createForm");
const firstNameInp = document.getElementById("firstName");
const lastNameInp = document.getElementById("lastName");
const ageInp = document.getElementById("age");
const emailInp = document.getElementById("email");

const loader = document.getElementById("loader");
const noticeBox = document.getElementById("notice");
const errorBox = document.getElementById("error");
const container = document.getElementById("usersContainer");

getUsersBtn.addEventListener("click", getUsers);
searchBtn.addEventListener("click", searchUsers);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchUsers();
});
createForm.addEventListener("submit", onCreateSubmit);

function showLoading() {
  loader.classList.remove("hidden");
}
function hideLoading() {
  loader.classList.add("hidden");
}

function showNotice(text) {
  noticeBox.textContent = text;
  noticeBox.classList.remove("hidden");
}

function showError(text) {
  errorBox.textContent = text;
  errorBox.classList.remove("hidden");
}

function clearMessages() {
  noticeBox.classList.add("hidden");
  errorBox.classList.add("hidden");
}

async function getUsers() {
  container.replaceChildren();
  clearMessages();
  showLoading();

  try {
    const response = await fetch(BASE_URL + "?limit=10");
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    renderUsers(data.users);
  } catch (err) {
    console.error(err);
    showError("Failed to load users");
  } finally {
    hideLoading();
  }
}

async function searchUsers() {
  const query = searchInput.value.trim();
  if (!query) {
    getUsers();
    return;
  }

  container.replaceChildren();
  clearMessages();
  showLoading();

  try {
    const url = BASE_URL + "/search?q=" + encodeURIComponent(query);
    const response = await fetch(url);
    if (!response.ok) throw new Error("HTTP " + response.status);

    const data = await response.json();
    renderUsers(data.users);

    if (data.users.length === 0) {
      showNotice("Нічого не знайдено за запитом «" + query + "».");
    }
  } catch (err) {
    console.error(err);
    showError("Failed to load users");
  } finally {
    hideLoading();
  }
}

async function onCreateSubmit(event) {
  event.preventDefault();
  clearMessages();

  const newUser = {
    firstName: firstNameInp.value.trim(),
    lastName: lastNameInp.value.trim(),
    age: Number(ageInp.value),
    email: emailInp.value.trim(),
  };

  if (
    !newUser.firstName ||
    !newUser.lastName ||
    !newUser.email ||
    !newUser.age
  ) {
    showError("Заповніть усі поля форми.");
    return;
  }

  showLoading();

  try {
    const response = await fetch(BASE_URL + "/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (!response.ok) throw new Error("HTTP " + response.status);

    const created = await response.json();
    showNotice("User created successfully.");

    const card = createUserCard(created);
    container.prepend(card);

    createForm.reset();
  } catch (err) {
    console.error(err);
    showError("Failed to create user");
  } finally {
    hideLoading();
  }
}

async function updateUser(id, changes) {
  const response = await fetch(BASE_URL + "/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}

async function deleteUser(id) {
  const response = await fetch(BASE_URL + "/" + id, { method: "DELETE" });
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}

function renderUsers(users) {
  container.replaceChildren();
  users.forEach((user) => container.append(createUserCard(user)));
}

function createUserCard(user) {
  const card = document.createElement("div");
  card.className = "user-card";

  renderView();
  return card;

  function renderView() {
    card.replaceChildren();

    const name = document.createElement("h2");
    name.className = "user-name";
    name.textContent = user.firstName + " " + user.lastName;

    const emailRow = makeRow("Email", user.email);
    const phoneRow = makeRow("Телефон", user.phone);
    const ageRow = makeRow("Вік", String(user.age));

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-sm btn-edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", renderEdit);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-sm btn-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", onDelete);

    actions.append(editBtn, deleteBtn);
    card.append(name, emailRow, phoneRow, ageRow, actions);
  }

  function renderEdit() {
    card.replaceChildren();

    const title = document.createElement("h2");
    title.className = "user-name";
    title.textContent = "Редагування";

    const firstInput = makeEditField("First name", user.firstName);
    const lastInput = makeEditField("Last name", user.lastName);
    const ageInput = makeEditField("Age", String(user.age), "number");
    const emailInput = makeEditField("Email", user.email, "email");

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn btn-sm btn-save";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-sm";
    cancelBtn.textContent = "Cancel";
    cancelBtn.addEventListener("click", renderView);

    saveBtn.addEventListener("click", async () => {
      const changes = {
        firstName: firstInput.input.value.trim(),
        lastName: lastInput.input.value.trim(),
        age: Number(ageInput.input.value),
        email: emailInput.input.value.trim(),
      };

      clearMessages();
      showLoading();
      saveBtn.disabled = true;

      try {
        const updated = await updateUser(user.id, changes);
        Object.assign(user, updated);
        showNotice("User updated successfully.");
        renderView();
      } catch (err) {
        console.error(err);
        showError("Failed to update user");
        saveBtn.disabled = false;
      } finally {
        hideLoading();
      }
    });

    actions.append(saveBtn, cancelBtn);
    card.append(
      title,
      firstInput.label,
      firstInput.input,
      lastInput.label,
      lastInput.input,
      ageInput.label,
      ageInput.input,
      emailInput.label,
      emailInput.input,
      actions,
    );
  }

  async function onDelete() {
    if (!confirm("Delete this user?")) return;

    clearMessages();
    showLoading();

    try {
      await deleteUser(user.id);
      card.remove();
      showNotice("User deleted successfully.");
    } catch (err) {
      console.error(err);
      showError("Failed to delete user");
    } finally {
      hideLoading();
    }
  }
}

function makeRow(label, value) {
  const row = document.createElement("div");
  row.className = "user-row";

  const labelEl = document.createElement("span");
  labelEl.className = "user-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("span");
  valueEl.className = "user-value";
  valueEl.textContent = value;

  row.append(labelEl, valueEl);
  return row;
}

function makeEditField(labelText, value, type) {
  const label = document.createElement("label");
  label.className = "edit-field label";
  label.textContent = labelText;

  const input = document.createElement("input");
  input.className = "field edit-field";
  input.type = type || "text";
  input.value = value;

  return { label, input };
}
