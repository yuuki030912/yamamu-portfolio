// ===== DOM要素 =====
// videos は videos.js から読み込み済み
const videoGrid = document.getElementById("videoGrid");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const categoryChips = document.querySelectorAll(".category-chip");
const themeToggle = document.getElementById("themeToggle");

let currentCategory = "all";
let currentSearch = "";

// ===== 動画カードの生成 =====
function createVideoCard(video) {
  const card = document.createElement("a");
  card.className = "video-card";
  card.href = `video-${video.category}-${video.id}.html`;
  card.setAttribute("data-category", video.category);

  const categoryLabel = {
    short: "ショート",
    inazuma: "イナイレV",
    pokepoke: "ポケポケ",
    minecraft: "マイクラ"
  };

  card.innerHTML = `
    <div class="video-thumbnail">
      <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg"
           alt="${video.title}"
           loading="lazy">
      <span class="video-duration">${video.duration}</span>
    </div>
    <div class="video-info">
      <h3 class="video-title">${video.title}</h3>
      <p class="video-meta">${video.views}回視聴 ・ ${formatDate(video.date)}</p>
      <span class="video-category-tag">${categoryLabel[video.category] || video.category}</span>
    </div>
  `;

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
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  if (days < 365) return `${Math.floor(days / 30)}か月前`;
  return `${Math.floor(days / 365)}年前`;
}

// ===== 動画の表示 =====
function renderVideos() {
  videoGrid.innerHTML = "";

  const filtered = videos.filter(video => {
    const matchCategory = currentCategory === "all" || video.category === currentCategory;
    const matchSearch = currentSearch === "" ||
      video.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      video.description.toLowerCase().includes(currentSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    videoGrid.innerHTML = '<div class="no-results">該当する動画が見つかりませんでした。</div>';
    return;
  }

  filtered.forEach(video => {
    videoGrid.appendChild(createVideoCard(video));
  });
}

// ===== カテゴリフィルター =====
categoryChips.forEach(chip => {
  chip.addEventListener("click", () => {
    categoryChips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    currentCategory = chip.dataset.category;
    renderVideos();
  });
});

// ===== 検索 =====
searchBtn.addEventListener("click", () => {
  currentSearch = searchInput.value.trim();
  renderVideos();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    currentSearch = searchInput.value.trim();
    renderVideos();
  }
});

searchInput.addEventListener("input", () => {
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

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  setTheme(!isDark);
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  setTheme(true);
}

// ===== 初期表示 =====
renderVideos();
