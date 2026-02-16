// ===== DOM要素 =====
// videos は videos.js から読み込み済み
const videoGrid = document.getElementById("videoGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const categoryChips = document.querySelectorAll(".category-chip");
const themeToggle = document.getElementById("themeToggle");

let currentCategory = "all";
let currentSearch = "";

// ===== HTMLエスケープ =====
function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ===== 動画カードの生成（XSS安全） =====
function createVideoCard(video) {
  const categoryLabel = {
    short: "ショート",
    inazuma: "イナイレV",
    pokepoke: "ポケポケ",
    minecraft: "マイクラ"
  };

  const card = document.createElement("a");
  card.className = "video-card";
  card.href = "video-" + video.category + "-" + video.id + ".html";
  card.setAttribute("data-category", video.category);

  // サムネイル
  const thumbDiv = document.createElement("div");
  thumbDiv.className = "video-thumbnail";

  const img = document.createElement("img");
  img.src = "https://img.youtube.com/vi/" + encodeURIComponent(video.id) + "/mqdefault.jpg";
  img.alt = video.title;
  img.loading = "lazy";
  thumbDiv.appendChild(img);

  const duration = document.createElement("span");
  duration.className = "video-duration";
  duration.textContent = video.duration;
  thumbDiv.appendChild(duration);

  card.appendChild(thumbDiv);

  // 動画情報
  const infoDiv = document.createElement("div");
  infoDiv.className = "video-info";

  const title = document.createElement("h3");
  title.className = "video-title";
  title.textContent = video.title;
  infoDiv.appendChild(title);

  const meta = document.createElement("p");
  meta.className = "video-meta";
  meta.textContent = video.views + "回視聴 ・ " + formatDate(video.date);
  infoDiv.appendChild(meta);

  const tag = document.createElement("span");
  tag.className = "video-category-tag";
  tag.textContent = categoryLabel[video.category] || video.category;
  infoDiv.appendChild(tag);

  card.appendChild(infoDiv);

  return card;
}

// ===== 日付フォーマット =====
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "今日";
  if (days === 1) return "1日前";
  if (days < 7) return days + "日前";
  if (days < 30) return Math.floor(days / 7) + "週間前";
  if (days < 365) return Math.floor(days / 30) + "か月前";
  return Math.floor(days / 365) + "年前";
}

// ===== 動画の表示 =====
function renderVideos() {
  videoGrid.innerHTML = "";

  const filtered = videos.filter(function(video) {
    const matchCategory = currentCategory === "all" || video.category === currentCategory;
    const matchSearch = currentSearch === "" ||
      video.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      video.description.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    var noResults = document.createElement("div");
    noResults.className = "no-results";
    noResults.textContent = "該当する動画が見つかりませんでした。";
    videoGrid.appendChild(noResults);
    return;
  }

  filtered.forEach(function(video) {
    videoGrid.appendChild(createVideoCard(video));
  });
}

// ===== カテゴリフィルター =====
categoryChips.forEach(function(chip) {
  chip.addEventListener("click", function() {
    categoryChips.forEach(function(c) { c.classList.remove("active"); });
    chip.classList.add("active");
    currentCategory = chip.dataset.category;
    renderVideos();
  });
});

// ===== 検索 =====
searchBtn.addEventListener("click", function() {
  currentSearch = searchInput.value.trim();
  renderVideos();
});

searchInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    currentSearch = searchInput.value.trim();
    renderVideos();
  }
});

searchInput.addEventListener("input", function() {
  if (searchInput.value === "") {
    currentSearch = "";
    renderVideos();
  }
});

// ===== ダークテーマ切替 =====
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

// ===== 初期表示 =====
renderVideos();
