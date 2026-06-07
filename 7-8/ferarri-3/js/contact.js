document.addEventListener("DOMContentLoaded", () => {
  initContactForm();
});

const DRAFT_KEY = "contactDraft";

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const message = form.querySelector("#message");
  const counter = form.querySelector("#char-counter");
  const result = document.querySelector("#form-result");
  const resultBody = document.querySelector("#form-result-body");

  const MAX = 500;
  function updateCounter() {
    if (counter && message)
      counter.textContent = `${message.value.length} / ${MAX}`;
  }

  restoreDraft(form);
  updateCounter();

  form.addEventListener("input", () => {
    saveDraft(form);
    updateCounter();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm(form)) return;

    const data = Object.fromEntries(new FormData(form).entries());

    showResult(result, resultBody, data);

    localStorage.removeItem(DRAFT_KEY);
    form.reset();
    updateCounter();
    clearErrors(form);
  });

  initClearDraft(form, updateCounter);
}

function validateForm(form) {
  let valid = true;

  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const message = form.querySelector("#message");
  const agree = form.querySelector('[name="agree"]');

  clearErrors(form);

  if (name.value.trim().length < 2) {
    setError(form, "name", "Ім'я має містити щонайменше 2 символи.");
    valid = false;
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  if (!emailOk) {
    setError(form, "email", "Введіть коректний email.");
    valid = false;
  }

  if (message.value.trim() === "") {
    setError(form, "message", "Повідомлення не може бути порожнім.");
    valid = false;
  }

  if (!agree.checked) {
    setError(form, "agree", "Потрібно погодитися з умовами.");
    valid = false;
  }

  return valid;
}

function setError(form, fieldName, text) {
  const errorEl = form.querySelector(`[data-error-for="${fieldName}"]`);
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (errorEl) errorEl.textContent = text;
  if (field) field.classList.add("invalid");
}

function clearErrors(form) {
  form.querySelectorAll(".error-text").forEach((el) => (el.textContent = ""));
  form
    .querySelectorAll(".invalid")
    .forEach((el) => el.classList.remove("invalid"));
}

function saveDraft(form) {
  const draft = {
    name: form.querySelector("#name").value,
    email: form.querySelector("#email").value,
    topic: form.querySelector("#topic").value,
    contact: form.querySelector('[name="contact"]:checked')?.value || "",
    message: form.querySelector("#message").value,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function restoreDraft(form) {
  const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  if (draft.name) form.querySelector("#name").value = draft.name;
  if (draft.email) form.querySelector("#email").value = draft.email;
  if (draft.topic) form.querySelector("#topic").value = draft.topic;
  if (draft.message) form.querySelector("#message").value = draft.message;
  if (draft.contact) {
    const radio = form.querySelector(
      `[name="contact"][value="${draft.contact}"]`,
    );
    if (radio) radio.checked = true;
  }
}

function showResult(result, resultBody, data) {
  if (!result || !resultBody) return;

  const labels = {
    name: "Ім'я",
    email: "Email",
    topic: "Тема",
    contact: "Спосіб зв'язку",
    message: "Повідомлення",
    agree: "Згода",
  };

  resultBody.innerHTML = "";
  Object.keys(data).forEach((key) => {
    const row = document.createElement("p");
    const label = document.createElement("strong");
    label.textContent = (labels[key] || key) + ": ";
    row.append(label, document.createTextNode(data[key]));
    resultBody.append(row);
  });

  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth" });
}

function initClearDraft(form, updateCounter) {
  const clearBtn = document.querySelector("#clear-draft");
  const modal = document.querySelector("#confirm-modal");
  if (!clearBtn || !modal) return;

  const yesBtn = modal.querySelector("#confirm-yes");

  function openConfirm() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }
  function closeConfirm() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  clearBtn.addEventListener("click", openConfirm);

  yesBtn.addEventListener("click", () => {
    localStorage.removeItem(DRAFT_KEY);
    form.reset();
    clearErrors(form);
    updateCounter();
    closeConfirm();
  });

  modal.querySelectorAll("[data-confirm-close]").forEach((el) => {
    el.addEventListener("click", closeConfirm);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open"))
      closeConfirm();
  });
}
