/* サイトの整合チェック。**ゲームを追加したら必ず走らせること。**
 *
 * ゲーム数は5ファイル・十数箇所に散らばっていて、手で直すと必ずどこかが取り残される。
 * 実際 SIGILYNX(#14) を足したとき、/ai-games/ の一覧は直したのに
 * /games/・トップ・about が13のまま公開されていた。
 *
 *   node ai-games/check-site.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const playDir = path.join(root, 'ai-games', 'play');
const games = fs.readdirSync(playDir).filter((f) => f.endsWith('.html'));
const N = games.length;
const problems = [];

// ---- ① ゲーム数の表記が全部そろっているか ----
const countFiles = ['index.html', 'about/index.html', 'games/index.html', 'ai-games/index.html'];
for (const rel of countFiles) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) continue;
  const s = fs.readFileSync(p, 'utf8');
  // 「13作」「13本の無料ブラウザゲーム」など、ゲーム数を指す言い回しだけを見る
  const patterns = [/全(\d+)作/g, /(\d+)作品を無料公開/g, /(\d+)本の無料ブラウザゲーム/g,
    /(\d+)本コレクション/g, /(\d+) TITLES/g, /<b>(\d+)<\/b> PLAYABLE/g,
    /(\d+)本から選ぶ/g, /AIで生まれた(\d+)本/g, /(\d+)本、全部/g];
  for (const re of patterns) {
    for (const m of s.matchAll(re)) {
      if (Number(m[1]) !== N) problems.push(`${rel}: 「${m[0]}」が実数 ${N} と違う`);
    }
  }
}

// ---- ② 各ゲームに一覧カードと sitemap のエントリがあるか ----
const portal = fs.readFileSync(path.join(root, 'ai-games', 'index.html'), 'utf8');
const gamesPage = fs.readFileSync(path.join(root, 'games', 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'ai-games', 'sitemap.xml'), 'utf8');
for (const f of games) {
  const slug = f.replace(/\.html$/, '');
  if (!portal.includes(`play/${f}`)) problems.push(`ai-games/index.html に ${slug} のカードが無い`);
  if (!gamesPage.includes(`play/${f}`)) problems.push(`games/index.html に ${slug} のカードが無い`);
  if (!sitemap.includes(`play/${f}`)) problems.push(`ai-games/sitemap.xml に ${slug} が無い`);
  const ogp = path.join(root, 'ai-games', `ogp-${slug}.png`);
  if (!fs.existsSync(ogp)) problems.push(`ai-games/ogp-${slug}.png が無い（/games はここを読む）`);
}

// ---- ③ 全画面は「ブラウザのウィンドウいっぱい」に統一されているか ----
// ネイティブ Fullscreen API はディスプレイ全体を占有してタブもURL欄も消してしまうので使わない。
// 全ページ CSS の擬似全画面（.pseudo-fs = position:fixed; inset:0）に一本化してある。
for (const f of games) {
  const s = fs.readFileSync(path.join(playDir, f), 'utf8');
  if (/requestFullscreen/.test(s)) problems.push(`play/${f}: ネイティブ全画面(requestFullscreen)を呼んでいる`);
  if (!/\.pseudo-fs\s*\{[^}]*position:fixed/.test(s)) problems.push(`play/${f}: 擬似全画面(.pseudo-fs)が無い`);
  if (!s.includes('max-height:none')) problems.push(`play/${f}: 全画面で max-height を解除していない`);
  if (!/Escape/.test(s)) problems.push(`play/${f}: 擬似全画面を Esc で閉じられない`);
}

console.log(JSON.stringify({ games: N, problems: problems.length }, null, 2));
if (problems.length) {
  console.error('\n' + problems.map((p) => '  ★ ' + p).join('\n'));
  process.exit(1);
}
console.log('OK');
