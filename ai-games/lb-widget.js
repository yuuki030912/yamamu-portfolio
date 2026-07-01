/* ============================================================
   やまむー AIゲーム 共有オンラインランキング ウィジェット
   使い方:
     <script>window.LB_GAME='neon-drifter';</script>
     <script src="/ai-games/lb-widget.js"></script>
   ゲーム側:
     LBW.gameover(score)  … ゲームオーバー時に呼ぶ（名前登録→TOP10表示）
     LBW.open()           … 「🏆ランキング」ボタン等から呼ぶ（TOP10表示のみ）
   バックエンドは Cloudflare Worker (chain-burst-versus) の /lb を game 別に共有。
   ============================================================ */
(function () {
  var GAME = (window.LB_GAME ||
    (document.currentScript && document.currentScript.getAttribute('data-game')) || 'game')
    .toString().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'game';
  var API = 'https://chain-burst-versus.yamamu.workers.dev';
  var NAMEKEY = 'lb_name';

  var css = ''
    + '#lbw-ov{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;'
    + 'background:rgba(6,7,18,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:18px;'
    + 'font-family:-apple-system,"Segoe UI",Roboto,"Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif;box-sizing:border-box}'
    + '#lbw-ov.show{display:flex}'
    + '#lbw-card{width:min(380px,94vw);max-height:88vh;overflow:auto;background:#141633;border:1px solid rgba(120,140,255,.25);'
    + 'border-radius:18px;padding:20px;color:#eaf0ff;box-shadow:0 16px 50px rgba(0,0,0,.55);text-align:center}'
    + '#lbw-card h2{margin:0 0 2px;font-size:24px;font-weight:900;background:linear-gradient(95deg,#ff9a3c,#ffd24c 45%,#4cc6ff);-webkit-background-clip:text;background-clip:text;color:transparent}'
    + '#lbw-card .lbw-sub{font-size:12px;color:#9aa6d8;margin-bottom:12px}'
    + '#lbw-card .lbw-score{font-size:14px;color:#9aa6d8;margin-bottom:8px}'
    + '#lbw-card .lbw-score b{font-size:30px;color:#ff9a3c;font-weight:900;display:block}'
    + '#lbw-list{display:flex;flex-direction:column;gap:5px;margin:8px 0;text-align:left}'
    + '.lbw-row{display:flex;align-items:center;gap:10px;background:rgba(20,22,46,.7);border:1px solid rgba(120,140,255,.18);border-radius:11px;padding:8px 12px;font-weight:800}'
    + '.lbw-row .rk{width:34px;text-align:center;font-size:15px;color:#9aa6d8;flex:0 0 auto}'
    + '.lbw-row .rn{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.lbw-row .rs{font-variant-numeric:tabular-nums;color:#ff9a3c}'
    + '.lbw-row.you{background:linear-gradient(90deg,rgba(255,154,60,.28),rgba(255,154,60,.1));border-color:#ff9a3c}'
    + '.lbw-row.top1{background:linear-gradient(90deg,rgba(255,210,76,.22),rgba(255,210,76,.05));border-color:#ffd24c}'
    + '.lbw-empty{opacity:.75;padding:16px;font-size:14px}'
    + '#lbw-reg{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin:6px 0}'
    + '#lbw-name{font-size:17px;padding:10px 12px;border-radius:11px;border:1px solid rgba(120,140,255,.25);background:#10132e;color:#fff;text-align:center;width:150px}'
    + '.lbw-btn{border:none;border-radius:12px;cursor:pointer;font-weight:800;font-family:inherit}'
    + '.lbw-btn.main{background:linear-gradient(95deg,#ff8a3c,#ffba4c);color:#241000;padding:11px 20px;font-size:16px}'
    + '.lbw-btn.sec{background:#2b3060;color:#eaf0ff;padding:10px 18px;font-size:14px;margin-top:8px}'
    + '#lbw-msg{min-height:16px;font-size:13px;color:#5fe39a;margin:2px 0}';

  var el = null;
  function build() {
    if (el) return el;
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    el = document.createElement('div'); el.id = 'lbw-ov';
    el.innerHTML =
      '<div id="lbw-card">'
      + '<h2>🏆 ランキング</h2><div class="lbw-sub">TOP10</div>'
      + '<div id="lbw-scorebox" style="display:none" class="lbw-score">スコア<b id="lbw-score">0</b></div>'
      + '<div id="lbw-reg" style="display:none"><input id="lbw-name" maxlength="12" placeholder="なまえ"><button class="lbw-btn main" id="lbw-regbtn">登録</button></div>'
      + '<div id="lbw-msg"></div>'
      + '<div id="lbw-list"></div>'
      + '<button class="lbw-btn sec" id="lbw-close">とじる</button>'
      + '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) { if (e.target === el) hide(); });
    el.querySelector('#lbw-close').addEventListener('click', hide);
    el.querySelector('#lbw-regbtn').addEventListener('click', doSubmit);
    return el;
  }
  function show() { build().classList.add('show'); }
  function hide() { if (el) el.classList.remove('show'); }
  function esc(s) { return ('' + s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function fetchTop() {
    return fetch(API + '/lb/top?game=' + GAME).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j ? (j.top || []) : null; }).catch(function () { return null; });
  }
  function postScore(name, score) {
    return fetch(API + '/lb/submit?game=' + GAME, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, score: score }) })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function renderList(top, myRank, myScore) {
    var wrap = el.querySelector('#lbw-list');
    if (top === null) { wrap.innerHTML = '<div class="lbw-empty">ランキングを取得できませんでした🥲<br>（ネット接続を確認してね）</div>'; return; }
    if (!top.length) { wrap.innerHTML = '<div class="lbw-empty">まだ記録がありません。<br>あなたが最初の1位を目指せ！🏆</div>'; return; }
    var med = ['🥇', '🥈', '🥉'], html = '';
    for (var i = 0; i < top.length; i++) {
      var you = (myRank && (i + 1) === myRank) ? ' you' : '', t1 = (i === 0) ? ' top1' : '';
      html += '<div class="lbw-row' + t1 + you + '"><span class="rk">' + (med[i] || ('#' + (i + 1))) + '</span><span class="rn">' + esc(top[i].name) + '</span><span class="rs">' + Number(top[i].score).toLocaleString() + '</span></div>';
    }
    if (myRank && myRank > 10) html += '<div class="lbw-row you"><span class="rk">#' + myRank + '</span><span class="rn">あなた</span><span class="rs">' + Number(myScore).toLocaleString() + '</span></div>';
    wrap.innerHTML = html;
  }

  var pendingScore = 0;
  function doSubmit() {
    var name = (el.querySelector('#lbw-name').value || '').trim().slice(0, 12) || 'ゲスト';
    try { localStorage.setItem(NAMEKEY, name); } catch (e) {}
    var msg = el.querySelector('#lbw-msg'), btn = el.querySelector('#lbw-regbtn');
    msg.style.color = '#9aa6d8'; msg.textContent = '送信中…'; btn.disabled = true;
    postScore(name, pendingScore).then(function (res) {
      btn.disabled = false;
      if (!res || res.error) { msg.style.color = '#ff8a8a'; msg.textContent = '送信に失敗しました🥲（接続を確認）'; return; }
      el.querySelector('#lbw-reg').style.display = 'none';
      el.querySelector('#lbw-scorebox').style.display = 'none';
      msg.style.color = '#5fe39a';
      msg.textContent = res.rank ? ('🎉 あなたは ' + res.rank + '位！') : '登録しました！';
      renderList(res.top, res.rank, res.score);
    });
  }

  window.LBW = {
    open: function () {
      build(); show();
      el.querySelector('#lbw-reg').style.display = 'none';
      el.querySelector('#lbw-scorebox').style.display = 'none';
      el.querySelector('#lbw-msg').textContent = '';
      el.querySelector('#lbw-list').innerHTML = '<div class="lbw-empty">読み込み中…</div>';
      fetchTop().then(function (t) { renderList(t, null, null); });
    },
    gameover: function (score) {
      score = Math.floor(Number(score)) || 0;
      pendingScore = score;
      build(); show();
      el.querySelector('#lbw-scorebox').style.display = '';
      el.querySelector('#lbw-score').textContent = score.toLocaleString();
      el.querySelector('#lbw-reg').style.display = 'flex';
      el.querySelector('#lbw-regbtn').disabled = false;
      el.querySelector('#lbw-msg').textContent = '';
      try { el.querySelector('#lbw-name').value = localStorage.getItem(NAMEKEY) || ''; } catch (e) {}
      el.querySelector('#lbw-list').innerHTML = '<div class="lbw-empty">読み込み中…</div>';
      fetchTop().then(function (t) { renderList(t, null, null); });
    }
  };
})();
