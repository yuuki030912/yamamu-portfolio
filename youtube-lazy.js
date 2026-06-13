/**
 * YouTube iframe 遅延読み込み（Lazy Load）
 * サムネイル画像を先に表示し、クリック時にiframeを読み込む
 * LCP・Core Web Vitals 改善用
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var containers = document.querySelectorAll('.yt-lazy');

    for (var i = 0; i < containers.length; i++) {
      (function(container) {
        var videoId = container.getAttribute('data-video-id');
        var title = container.getAttribute('data-title') || '';

        if (!videoId) return;

        // サムネイル画像を設定（高品質版）
        var thumb = document.createElement('img');
        thumb.src = 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
        thumb.alt = title;
        thumb.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;';
        thumb.loading = 'eager';
        container.appendChild(thumb);

        // 再生ボタンオーバーレイ
        var playBtn = document.createElement('button');
        playBtn.setAttribute('aria-label', '動画を再生: ' + title);
        playBtn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:68px;height:48px;background:rgba(0,0,0,0.7);border:none;border-radius:12px;cursor:pointer;z-index:2;transition:background 0.2s;';
        playBtn.innerHTML = '<svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.5C4 2.3 2.3 4.8 1.5 7.7.1 13 0 24 0 24s.1 11 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.5c2.9-.8 4.6-3.3 5.4-6.2C67.9 35 68 24 68 24s-.1-11-1.5-16.3z" fill="red"/><path d="M45 24L27 14v20" fill="#fff"/></svg>';
        container.appendChild(playBtn);

        // ホバーエフェクト
        playBtn.addEventListener('mouseenter', function() {
          playBtn.style.background = 'rgba(255,0,0,0.9)';
        });
        playBtn.addEventListener('mouseleave', function() {
          playBtn.style.background = 'rgba(0,0,0,0.7)';
        });

        // クリックでiframe読み込み
        function loadIframe() {
          var iframe = document.createElement('iframe');
          iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
          iframe.title = title;
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
          iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          iframe.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; picture-in-picture');
          iframe.setAttribute('allowfullscreen', '');
          iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';

          // サムネイルとボタンを削除してiframeを挿入
          container.innerHTML = '';
          container.appendChild(iframe);
        }

        container.addEventListener('click', loadIframe);
      })(containers[i]);
    }
  });
})();

/**
 * YouTube チャンネル登録 CTA を全動画ページに自動挿入
 * - 動画直下に登録ボタン（最も成約しやすい位置）
 * - スマホでは画面下に追従バーを表示（1セッション1回まで）
 * CSP: 'self' の外部JSなのでインライン制約に抵触しない
 */
(function () {
  'use strict';
  var CHANNEL = 'https://www.youtube.com/@yamamu';
  var SUBSCRIBE = CHANNEL + '?sub_confirmation=1';

  function ytIcon(size) {
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<path fill="#ff0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>' +
      '<path fill="#fff" d="M9.6 15.5V8.5l6.3 3.5z"/></svg>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 動画ページ以外（playerが無い）では何もしない
    var anchor = document.querySelector('.video-detail') || document.querySelector('.video-player-section');
    if (!anchor) return;

    // --- 動画直下のメインCTA ---
    var cta = document.createElement('section');
    cta.className = 'yt-cta';
    cta.innerHTML =
      '<div class="yt-cta-title">この攻略が役に立ったら<br>チャンネル登録で最新攻略をチェック！</div>' +
      '<div class="yt-cta-sub">総プレイ1200時間超のやり込み攻略を毎週配信中</div>' +
      '<div class="yt-cta-btns">' +
        '<a class="yt-cta-btn yt-cta-btn-primary" href="' + SUBSCRIBE + '" target="_blank" rel="noopener noreferrer">' + ytIcon(20) + 'チャンネル登録する</a>' +
        '<a class="yt-cta-btn yt-cta-btn-secondary" href="' + CHANNEL + '/videos" target="_blank" rel="noopener noreferrer">他の攻略動画を見る</a>' +
      '</div>';
    anchor.parentNode.insertBefore(cta, anchor.nextSibling);

    // --- スマホ追従バー（閉じたら当面非表示） ---
    try {
      if (sessionStorage.getItem('ytFloatClosed') === '1') return;
    } catch (e) {}

    var bar = document.createElement('div');
    bar.className = 'yt-cta-float';
    bar.innerHTML =
      '<span class="yt-cta-float-text">やまむーの攻略動画を<br>もっと見る</span>' +
      '<a class="yt-cta-float-btn" href="' + SUBSCRIBE + '" target="_blank" rel="noopener noreferrer">' + ytIcon(16) + 'チャンネル登録</a>' +
      '<button class="yt-cta-float-close" aria-label="閉じる">&times;</button>';
    document.body.appendChild(bar);
    document.body.classList.add('has-float-cta');

    bar.querySelector('.yt-cta-float-close').addEventListener('click', function () {
      bar.remove();
      document.body.classList.remove('has-float-cta');
      try { sessionStorage.setItem('ytFloatClosed', '1'); } catch (e) {}
    });
  });
})();
