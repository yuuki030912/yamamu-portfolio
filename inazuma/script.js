// ===== DOM要素 =====
// videos は videos.js から読み込み済み
var searchInput = document.getElementById("searchInput");
var searchBtn = document.getElementById("searchBtn");
var themeToggle = document.getElementById("themeToggle");

// ===== テーマ分類 =====
var themeConfig = {
  build: { name: "ビルド・パッシブ攻略", anchor: "build" },
  equipment: { name: "装備・ビーンズ攻略", anchor: "equipment" },
  battle: { name: "対戦テクニック・立ち回り", anchor: "battle" },
  farming: { name: "周回・効率プレイ", anchor: "farming" },
  update: { name: "アップデート・環境考察", anchor: "update" },
  beginner: { name: "初心者向けガイド", anchor: "beginner" }
};

function getThemeCategory(video) {
  var tags = (video.tags || []).join(" ").toLowerCase();
  if (video.category === "inazuma") {
    if (tags.indexOf("パッシブ") >= 0 || tags.indexOf("ビルド") >= 0) return "build";
    if (tags.indexOf("装備") >= 0 || tags.indexOf("ビーンズ") >= 0) return "equipment";
    if (tags.indexOf("周回") >= 0 || tags.indexOf("hero") >= 0 || tags.indexOf("効率") >= 0) return "farming";
    if (tags.indexOf("アップデート") >= 0 || tags.indexOf("basara") >= 0 || tags.indexOf("アプデ") >= 0) return "update";
    if (tags.indexOf("初心者") >= 0 || tags.indexOf("フォーカス") >= 0 || tags.indexOf("キズナ") >= 0) return "beginner";
    if (tags.indexOf("対戦") >= 0 || tags.indexOf("テンション") >= 0 || tags.indexOf("タクティクス") >= 0 || tags.indexOf("戦い方") >= 0) return "battle";
    return "battle";
  }
  return "general";
}

function parseViews(v) {
  return parseInt((v.views || "0").replace(/,/g, ""), 10);
}

// ===== ショート動画判定（2分未満） =====
function isShortVideo(v) {
  var dur = v.duration || "";
  var parts = dur.split(":");
  if (parts.length === 2) {
    var min = parseInt(parts[0], 10);
    return min < 2;
  }
  return false;
}

// ===== HTMLエスケープ =====
function escapeText(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== 動画カード生成 =====
function createVideoCard(video) {
  var card = document.createElement("a");
  card.className = "video-card";
  card.href = "video-" + video.category + "-" + video.id + ".html";

  var thumbDiv = document.createElement("div");
  thumbDiv.className = "video-thumbnail";
  var img = document.createElement("img");
  img.src = "https://img.youtube.com/vi/" + encodeURIComponent(video.id) + "/mqdefault.jpg";
  img.alt = video.title;
  img.loading = "lazy";
  thumbDiv.appendChild(img);
  var dur = document.createElement("span");
  dur.className = "video-duration";
  dur.textContent = video.duration;
  thumbDiv.appendChild(dur);
  card.appendChild(thumbDiv);

  var infoDiv = document.createElement("div");
  infoDiv.className = "video-info";
  var title = document.createElement("h3");
  title.className = "video-title";
  title.textContent = video.title;
  infoDiv.appendChild(title);
  var meta = document.createElement("p");
  meta.className = "video-meta";
  meta.textContent = video.views + "回視聴";
  infoDiv.appendChild(meta);
  card.appendChild(infoDiv);

  return card;
}

// ===== ピックアップ生成 =====
function renderPickup() {
  var pickupList = document.getElementById("pickupList");
  if (!pickupList) return;

  var inazumaVideos = videos.filter(function(v) { return v.category === "inazuma" && !isShortVideo(v); });
  var sorted = inazumaVideos.slice().sort(function(a, b) { return parseViews(b) - parseViews(a); });
  var top3 = sorted.slice(0, 3);

  top3.forEach(function(video) {
    var card = document.createElement("a");
    card.className = "pickup-card";
    card.href = "video-" + video.category + "-" + video.id + ".html";

    var thumb = document.createElement("div");
    thumb.className = "pickup-thumb";
    var img = document.createElement("img");
    img.src = "https://img.youtube.com/vi/" + encodeURIComponent(video.id) + "/mqdefault.jpg";
    img.alt = video.title;
    img.loading = "lazy";
    thumb.appendChild(img);
    card.appendChild(thumb);

    var body = document.createElement("div");
    body.className = "pickup-body";
    var badge = document.createElement("span");
    badge.className = "pickup-badge";
    badge.textContent = "注目";
    body.appendChild(badge);
    var title = document.createElement("div");
    title.className = "pickup-title";
    title.textContent = video.title;
    body.appendChild(title);
    var meta = document.createElement("div");
    meta.className = "pickup-meta";
    meta.textContent = video.views + "回視聴";
    body.appendChild(meta);
    card.appendChild(body);

    pickupList.appendChild(card);
  });
}

// ===== テーマ別セクション生成 =====
function renderThemeSections() {
  var container = document.getElementById("themeSections");
  if (!container) return;

  var inazumaVideos = videos.filter(function(v) { return v.category === "inazuma" && !isShortVideo(v); });

  // テーマ別に分類
  var themed = {};
  Object.keys(themeConfig).forEach(function(key) { themed[key] = []; });
  inazumaVideos.forEach(function(v) {
    var theme = getThemeCategory(v);
    if (themed[theme]) themed[theme].push(v);
  });

  // 各テーマをレンダリング
  var themeOrder = ["build", "equipment", "battle", "farming", "update", "beginner"];
  themeOrder.forEach(function(key) {
    var config = themeConfig[key];
    var vids = themed[key] || [];
    if (vids.length === 0) return;

    // 再生数順にソート
    vids.sort(function(a, b) { return parseViews(b) - parseViews(a); });
    var display = vids.slice(0, 4);

    var section = document.createElement("section");
    section.className = "home-section";

    var header = document.createElement("div");
    header.className = "home-section-header";
    var title = document.createElement("h2");
    title.className = "section-title";
    title.textContent = config.name;
    header.appendChild(title);
    var more = document.createElement("a");
    more.className = "home-section-more";
    more.href = "category-" + config.anchor + ".html";
    more.textContent = "もっと見る →";
    header.appendChild(more);
    section.appendChild(header);

    var grid = document.createElement("div");
    grid.className = "home-section-grid";
    display.forEach(function(v) {
      grid.appendChild(createVideoCard(v));
    });
    section.appendChild(grid);

    container.appendChild(section);
  });
}

// ===== 人気記事（サイドバー）=====
function renderPopularArticles() {
  var container = document.getElementById("popularArticles");
  if (!container) return;

  var inazumaVideos = videos.filter(function(v) { return v.category === "inazuma" && !isShortVideo(v); });
  var sorted = inazumaVideos.slice().sort(function(a, b) { return parseViews(b) - parseViews(a); });
  var top5 = sorted.slice(0, 5);

  top5.forEach(function(video, i) {
    var item = document.createElement("a");
    item.className = "popular-item";
    item.href = "video-" + video.category + "-" + video.id + ".html";

    var rank = document.createElement("span");
    rank.className = "popular-rank" + (i < 3 ? " rank-" + (i + 1) : " rank-other");
    rank.textContent = String(i + 1);
    item.appendChild(rank);

    var thumb = document.createElement("div");
    thumb.className = "popular-thumb";
    var img = document.createElement("img");
    img.src = "https://img.youtube.com/vi/" + encodeURIComponent(video.id) + "/mqdefault.jpg";
    img.alt = video.title;
    img.loading = "lazy";
    thumb.appendChild(img);
    item.appendChild(thumb);

    var title = document.createElement("span");
    title.className = "popular-title";
    title.textContent = video.title;
    item.appendChild(title);

    container.appendChild(item);
  });
}

// ===== SEO記事リスト生成 =====
function renderSeoArticleLists() {
  var topList = document.getElementById("seoArticleList");
  var restList = document.getElementById("seoArticleListRest");
  if (!topList || !restList) return;

  videos.slice(0, 10).forEach(function(v) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "video-" + v.category + "-" + v.id + ".html";
    a.textContent = v.title.substring(0, 60);
    li.appendChild(a);
    topList.appendChild(li);
  });

  videos.slice(10).forEach(function(v) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = "video-" + v.category + "-" + v.id + ".html";
    a.textContent = v.title.substring(0, 60);
    li.appendChild(a);
    restList.appendChild(li);
  });
}

// ===== ショート動画セクション生成 =====
function renderShortVideos() {
  var container = document.getElementById("shortVideosGrid");
  if (!container) return;

  var shorts = videos.filter(function(v) {
    return v.category === "inazuma" && isShortVideo(v);
  });
  shorts.sort(function(a, b) { return parseViews(b) - parseViews(a); });

  shorts.forEach(function(v) {
    container.appendChild(createVideoCard(v));
  });
}

// ===== 検索機能 =====
function performSearch() {
  var query = searchInput.value.trim().toLowerCase();
  var resultsArea = document.getElementById("searchResults");
  var resultsGrid = document.getElementById("searchResultsGrid");
  var countEl = document.getElementById("searchCount");
  var pickupSection = document.getElementById("pickupSection");
  var themeSections = document.getElementById("themeSections");
  var guideSection = document.querySelector(".guide-section");
  var shortsSection = document.getElementById("shortsSection");

  if (!query) {
    resultsArea.classList.remove("active");
    if (pickupSection) pickupSection.style.display = "";
    if (themeSections) themeSections.style.display = "";
    if (guideSection) guideSection.style.display = "";
    if (shortsSection) shortsSection.style.display = "";
    return;
  }

  var matched = videos.filter(function(v) {
    return v.title.toLowerCase().indexOf(query) >= 0 ||
      (v.description || "").toLowerCase().indexOf(query) >= 0 ||
      (v.tags || []).join(" ").toLowerCase().indexOf(query) >= 0;
  });

  resultsGrid.innerHTML = "";
  matched.forEach(function(v) {
    resultsGrid.appendChild(createVideoCard(v));
  });

  countEl.textContent = "「" + searchInput.value.trim() + "」の検索結果: " + matched.length + "件";
  resultsArea.classList.add("active");

  // 他のセクションを非表示
  if (pickupSection) pickupSection.style.display = "none";
  if (themeSections) themeSections.style.display = "none";
  if (guideSection) guideSection.style.display = "none";
  if (shortsSection) shortsSection.style.display = "none";
}

function closeSearch() {
  searchInput.value = "";
  var resultsArea = document.getElementById("searchResults");
  var pickupSection = document.getElementById("pickupSection");
  var themeSections = document.getElementById("themeSections");
  var guideSection = document.querySelector(".guide-section");
  var shortsSection = document.getElementById("shortsSection");

  resultsArea.classList.remove("active");
  if (pickupSection) pickupSection.style.display = "";
  if (themeSections) themeSections.style.display = "";
  if (guideSection) guideSection.style.display = "";
  if (shortsSection) shortsSection.style.display = "";
}

searchBtn.addEventListener("click", performSearch);
searchInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") performSearch();
});
searchInput.addEventListener("input", function() {
  if (searchInput.value === "") closeSearch();
});

var searchClose = document.getElementById("searchClose");
if (searchClose) {
  searchClose.addEventListener("click", closeSearch);
}

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
renderPickup();
renderThemeSections();
renderShortVideos();
renderPopularArticles();
renderSeoArticleLists();
