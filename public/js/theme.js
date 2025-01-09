document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.querySelector(".theme-btn");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");

  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme) {
    if (savedTheme === "dark-mode") {
      body.classList.add("dark-mode");
      themeBtn.style.setProperty("--translate", "translate(18px, 1px)");
    } else {
      body.classList.remove("dark-mode");
      themeBtn.style.setProperty("--translate", "translate(0px, 1px)");
    }
  } else {
    if (systemPrefersDark) {
      body.classList.add("dark-mode");
      themeBtn.style.setProperty("--translate", "translate(18px, 1px)");
    } else {
      body.classList.remove("dark-mode");
      themeBtn.style.setProperty("--translate", "translate(0px, 1px)");
    }
  }

  themeBtn.addEventListener("click", () => {
    if (body.classList.contains("dark-mode")) {
      body.classList.remove("dark-mode");
      themeBtn.style.setProperty("--translate", "translate(0px, 1px)");
      localStorage.setItem("theme", "light-mode");
    } else {
      body.classList.add("dark-mode");
      themeBtn.style.setProperty("--translate", "translate(18px, 1px)");
      localStorage.setItem("theme", "dark-mode");
    }
  });
});
