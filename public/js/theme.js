document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.querySelector(".theme-btn");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (!savedTheme) {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemPrefersDark) {
      body.classList.add("dark-mode");
    }
  } else {
    body.classList.add(savedTheme);
  }

  themeBtn.addEventListener("click", () => {
    if (body.classList.contains("dark-mode")) {
      themeBtn.style.setProperty('--translate', 'translate(18px, 1px)');
      body.classList.remove("dark-mode");
      localStorage.setItem("theme", "");
    } else {
      themeBtn.style.setProperty('--translate', 'translate(0, 1px)');
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    }
  });
});
