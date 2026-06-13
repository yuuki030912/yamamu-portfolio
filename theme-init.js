// 描画前にテーマを確定してダーク/ライトのちらつき(FOUC)を防ぐ。
// <head> 内で <script src="...theme-init.js"></script>（async/defer無し）で読み込むこと。
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var dark = saved === "dark" ||
      (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
})();
