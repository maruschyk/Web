const API_URL = "https://jsonplaceholder.typicode.com/users";
const STORAGE_KEY = "favoriteUsers";

const button = document.getElementById("getUsersBtn");
const toolbar = document.getElementById("toolbar");
const searchInput = document.getElementById("searchInput");
const cityFilter = document.getElementById("cityFilter");
const sortBy = document.getElementById("sortBy");
const favOnly = document.getElementById("favOnly");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const emptyState = document.getElementById("emptyState");
const container = document.getElementById("usersContainer");
const countEl = document.getElementById("count");

let allUsers = [];
button.addEventListener("click", loadUsers);
searchInput.addEventListener("input", applyView);
cityFilter.addEventListener("change", applyView);
sortBy.addEventListener("change", applyView);
favOnly.addEventListener("change", applyView);

async function loadUsers() {
  container.replaceChildren();
  emptyState.classList.add("hidden");
  errorBox.classList.add("hidden");
  toolbar.classList.add("hidden");
  countEl.textContent = "";

  loader.classList.remove("hidden");
  button.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }

    allUsers = await response.json();

    buildCityFilter(allUsers);
    toolbar.classList.remove("hidden");
    applyView();
  } catch (err) {
    console.error("Не вдалося завантажити користувачів:", err);
    errorBox.textContent = "Failed to load users";
    errorBox.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
    button.disabled = false;
  }
}

function buildCityFilter(users) {
  const cities = [...new Set(users.map((u) => u.address.city))].sort();
  cityFilter.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All cities";
  cityFilter.append(allOption);

  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    cityFilter.append(option);
  });
}

function searchUsers(users, term) {
  const q = term.trim().toLowerCase();
  if (!q) return users;

  return users.filter((u) => {
    const haystack = [
      u.name,
      u.username,
      u.email,
      u.company.name,
      u.address.city,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

function filterByCity(users, city) {
  if (city === "all") return users;
  return users.filter((u) => u.address.city === city);
}

function sortUsers(users, sortType) {
  const sorted = [...users];

  switch (sortType) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "username":
      sorted.sort((a, b) => a.username.localeCompare(b.username));
      break;
    case "city":
      sorted.sort((a, b) => a.address.city.localeCompare(b.address.city));
      break;
    case "company":
      sorted.sort((a, b) => a.company.name.localeCompare(b.company.name));
      break;
    default:
      break;
  }

  return sorted;
}

function getFavorites() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveFavorites(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  let favorites = getFavorites();

  if (favorites.includes(id)) {
    favorites = favorites.filter((favId) => favId !== id);
  } else {
    favorites.push(id);
  }

  saveFavorites(favorites);
}

function applyView() {
  let result = allUsers;

  result = filterByCity(result, cityFilter.value);

  result = searchUsers(result, searchInput.value);

  if (favOnly.checked) {
    const favorites = getFavorites();
    result = result.filter((u) => favorites.includes(u.id));
  }

  result = sortUsers(result, sortBy.value);

  renderUsers(result);

  if (result.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  countEl.textContent = "Показано: " + result.length + " із " + allUsers.length;
}

function renderUsers(users) {
  container.replaceChildren();

  users.forEach((user) => {
    const card = document.createElement("div");
    card.className = "user-card";

    const head = document.createElement("div");
    head.className = "user-head";

    const name = document.createElement("h2");
    name.className = "user-name";
    name.textContent = user.name;

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    favBtn.className = "fav-btn";
    favBtn.textContent = "★";
    favBtn.title = "Додати в обране";

    if (isFavorite(user.id)) {
      favBtn.classList.add("is-fav");
    }

    favBtn.addEventListener("click", () => {
      toggleFavorite(user.id);

      if (favOnly.checked) {
        applyView();
      } else {
        favBtn.classList.toggle("is-fav");
      }
    });

    head.append(name, favBtn);

    const username = document.createElement("div");
    username.className = "user-username";
    username.textContent = "@" + user.username;

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
    const cityRow = makeRow("Місто", user.address.city);
    const companyRow = makeRow("Компанія", user.company.name, "company");

    const siteRow = document.createElement("div");
    siteRow.className = "user-row";
    const siteLabel = document.createElement("span");
    siteLabel.className = "user-label";
    siteLabel.textContent = "Website";
    const siteValue = document.createElement("span");
    siteValue.className = "user-value";
    const link = document.createElement("a");
    link.href = "https://" + user.website;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = user.website;
    siteValue.append(link);
    siteRow.append(siteLabel, siteValue);

    card.append(
      head,
      username,
      emailRow,
      phoneRow,
      cityRow,
      companyRow,
      siteRow,
    );

    container.append(card);
  });
}
