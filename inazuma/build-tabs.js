/**
 * build-tabs.js — ビルド攻略ページ タブ切替
 * category-build.html 専用。サブカテゴリ別に動画を絞り込む。
 */
(function () {
  var chips = document.querySelectorAll(".build-tab-chip");
  var cards = document.querySelectorAll(".video-card[data-subcategory]");
  var countEl = document.getElementById("build-tab-count");
  if (!chips.length || !cards.length) return;

  function activateTab(subcategory) {
    // タブの active 切替
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].getAttribute("data-subcategory") === subcategory) {
        chips[i].classList.add("active");
      } else {
        chips[i].classList.remove("active");
      }
    }
    // カードの表示/非表示
    var shown = 0;
    for (var j = 0; j < cards.length; j++) {
      var match = subcategory === "all" || cards[j].getAttribute("data-subcategory") === subcategory;
      cards[j].style.display = match ? "" : "none";
      if (match) shown++;
    }
    // 件数表示を更新
    if (countEl) {
      countEl.textContent = shown + "\u672C\u306E\u52D5\u753B\u3092\u8868\u793A\u4E2D";
    }
  }

  // タブクリック
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener("click", function () {
      var sub = this.getAttribute("data-subcategory");
      history.replaceState(null, "", "#" + sub);
      activateTab(sub);
    });
  }

  // URLハッシュから初期タブを決定
  var validTabs = ["all", "justice", "rough", "counter", "passive-inherit", "other"];
  function readHash() {
    var hash = window.location.hash.replace("#", "");
    return validTabs.indexOf(hash) >= 0 ? hash : "all";
  }

  // ブラウザの戻る/進む対応
  window.addEventListener("hashchange", function () {
    activateTab(readHash());
  });

  // 初期表示
  activateTab(readHash());
})();
