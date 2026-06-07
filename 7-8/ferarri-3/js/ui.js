document.addEventListener("DOMContentLoaded", () => {
  initAccordion();
  initFilters();
  initModal();
  initFavorites();
});

function initAccordion() {
  const triggers = document.querySelectorAll(".accordion__trigger");
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;

      const icon = trigger.querySelector(".accordion__icon");
      if (icon) icon.textContent = isOpen ? "+" : "−";
    });
  });
}

function initFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".model-card");
  const emptyMsg = document.querySelector("#models-empty");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.filter;

      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      let visible = 0;
      cards.forEach((card) => {
        const match = category === "all" || card.dataset.category === category;
        card.hidden = !match;
        if (match) visible++;
      });

      if (emptyMsg) emptyMsg.hidden = visible > 0;
    });
  });
}

function initModal() {
  const modal = document.querySelector("#modal");
  if (!modal) return;

  const titleEl = modal.querySelector(".modal__title");
  const bodyEl = modal.querySelector(".modal__body");

  function openModal(title, bodyHTML) {
    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHTML;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { title, power, desc } = btn.dataset;
      openModal(
        title,
        `<p><strong>Потужність:</strong> ${power}</p><p>${desc}</p>`,
      );
    });
  });

  document.querySelectorAll(".zoomable").forEach((img) => {
    img.addEventListener("click", () => {
      openModal(
        img.dataset.title || "Зображення",
        `<img src="${img.src}" alt="${img.alt}" class="modal__image">`,
      );
    });
  });

  modal.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
}

function initFavorites() {
  const favButtons = document.querySelectorAll(".fav-btn");
  if (!favButtons.length) return;

  const KEY = "favoritesList";
  let favorites = JSON.parse(localStorage.getItem(KEY) || "[]");

  favButtons.forEach((btn) => {
    if (favorites.includes(btn.dataset.id)) {
      btn.classList.add("is-fav");
    }

    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (favorites.includes(id)) {
        favorites = favorites.filter((favId) => favId !== id);
        btn.classList.remove("is-fav");
      } else {
        favorites.push(id);
        btn.classList.add("is-fav");
      }
      localStorage.setItem(KEY, JSON.stringify(favorites));
    });
  });
}
