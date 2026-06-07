document.addEventListener("DOMContentLoaded", init);

function init() {
  initActiveNav();
  initMenuToggle();
  initThemeToggle();
  initBackToTop();
  initYear();
}

function initActiveNav() {
  const links = document.querySelectorAll(".nav-list a");
  if (!links.length) return;

  const current = location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const target = link.getAttribute("href").split("/").pop();
    if (target === current) {
      link.classList.add("is-active");
    }
  });
}

function initMenuToggle() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initThemeToggle() {
  const toggle = document.querySelector(".theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("siteTheme");
  if (savedTheme === "dark") {
    body.classList.add("theme-dark");
  }
  updateThemeIcon();

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const isDark = body.classList.toggle("theme-dark");
    localStorage.setItem("siteTheme", isDark ? "dark" : "light");
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (!toggle) return;
    toggle.textContent = body.classList.contains("theme-dark") ? "☀" : "🌙";
  }
}

function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 300);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initYear() {
  const yearEl = document.querySelector("#year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
