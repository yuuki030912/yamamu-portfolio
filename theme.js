// ===== ダークテーマ切替（共通） =====
(function() {
  var themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  function setTheme(dark) {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  themeToggle.addEventListener("click", function() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(!isDark);
  });

  var savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    setTheme(true);
  }
})();
