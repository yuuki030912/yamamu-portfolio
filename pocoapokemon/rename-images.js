#!/usr/bin/env node
/**
 * pos_NNN.png → slug.png にリネーム
 * ゲーム内図鑑はdexNumber順（未入手スキップ）で並んでいる
 * 各ページの開始ポケモン名から、スキップされたdexを特定してマッピング
 */
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('pocoapokemon/pokemon-data.json', 'utf8'));
const imgDir = 'pocoapokemon/img/pokemon';

// dexNumber順の全エントリ（イベント除外）
const all = [...data.pokemon]
  .filter(p => !p.isEventOnly)
  .sort((a, b) => {
    if (a.dexNumber !== b.dexNumber) return a.dexNumber - b.dexNumber;
    if (!a.variant && b.variant) return -1;
    if (a.variant && !b.variant) return 1;
    return (a.variant || '').localeCompare(b.variant || '');
  });

// 確認済みのページ開始ポケモン (pos番号 → dexNumber)
// これを使ってスキップされたdexNumberを逆算する
const pageStarts = [
  { pos: 1, dex: 1 },      // フシギダネ
  // pos29は不明 → ページ2の選択ポケモン読み取れず
  { pos: 57, dex: 34 },     // バルキー
  { pos: 85, dex: 66 },     // ドテッコツ
  { pos: 113, dex: 99 },    // ナッシー
  { pos: 141, dex: 131 },   // タブンネ
  { pos: 169, dex: 163 },   // ブーバー
  { pos: 197, dex: 195 },   // セキタンザン
  { pos: 225, dex: 230 },   // リキキリン
  { pos: 253, dex: 262 },   // ドラパルト
  { pos: 281, dex: 270 },   // デカヌチャン(おやかた)
];

// 各ページ開始位置のallでのindexを取得
const pageStartIndices = pageStarts.map(ps => {
  // デカヌチャン(おやかた)はvariant
  if (ps.dex === 270) {
    return { ...ps, allIdx: all.findIndex(p => p.slug === '270-oyakata') };
  }
  return { ...ps, allIdx: all.findIndex(p => p.dexNumber === ps.dex && !p.variant) };
});

// 各ページの開始allIdxと開始posから、スキップ数を計算
// pos P のポケモンは all[allIdx] に対応
// P = allIdx - (累計スキップ数) + 1
// → 累計スキップ数 = allIdx - P + 1
pageStartIndices.forEach(ps => {
  ps.cumulativeSkips = ps.allIdx - ps.pos + 1;
  console.log(`pos${ps.pos}: dex${ps.dex} → all[${ps.allIdx}], cumSkips=${ps.cumulativeSkips}`);
});

// ページ2の開始(pos29)を推測:
// ページ1のスキップ数 = pageStart[2].cumulativeSkips付近から線形補間
// pos1 cumSkips=0, pos57 cumSkips=pageStartIndices[1].cumulativeSkips
// pos29は中間 → cumSkips ≈ (0 + next) / 2 程度
// → ページ2の開始を正確に推測するのは難しいが、
// ページ間のスキップ数の変化から近似できる

// より良いアプローチ: 全posファイルに対して、allのindex = pos + cumulativeSkips - 1 で対応
// cumulativeSkipsはページごとに異なるが、ページ間で線形に増加すると仮定

// 実際には、各pos番号に対して正確なallIndexを決定する必要がある
// ページ開始間を線形補間でスキップ数を推定

function getCumulativeSkips(pos) {
  // ページ開始点から線形補間
  for (let i = pageStartIndices.length - 1; i >= 0; i--) {
    if (pos >= pageStartIndices[i].pos) {
      const current = pageStartIndices[i];
      const next = pageStartIndices[i + 1];

      if (!next) {
        // 最後のページ → スキップ数は一定と仮定
        return current.cumulativeSkips;
      }

      // ページ内では均等にスキップが分布すると仮定
      const posRange = next.pos - current.pos;
      const skipRange = next.cumulativeSkips - current.cumulativeSkips;
      const progress = (pos - current.pos) / posRange;
      return Math.round(current.cumulativeSkips + skipRange * progress);
    }
  }
  return 0;
}

// 全posファイルをリネーム
const posFiles = fs.readdirSync(imgDir)
  .filter(f => f.startsWith('pos_') && f.endsWith('.png'))
  .sort();

console.log(`\nTotal pos files: ${posFiles.length}`);

// まずtmpディレクトリにコピー
const tmpDir = path.join(imgDir, '_tmp');
fs.mkdirSync(tmpDir, { recursive: true });

let renamed = 0;
let unmapped = 0;
const results = [];

posFiles.forEach(f => {
  const pos = parseInt(f.replace('pos_', '').replace('.png', ''));
  const cumSkips = getCumulativeSkips(pos);
  const allIdx = pos - 1 + cumSkips;

  if (allIdx >= 0 && allIdx < all.length) {
    const pokemon = all[allIdx];
    const slug = pokemon.slug;
    const dstFile = path.join(tmpDir, slug + '.png');
    fs.copyFileSync(path.join(imgDir, f), dstFile);
    results.push({ pos, slug, name: pokemon.name + (pokemon.variant ? '(' + pokemon.variant + ')' : '') });
    renamed++;
  } else {
    console.log(`  pos${pos}: allIdx=${allIdx} OUT OF RANGE`);
    unmapped++;
  }
});

// pos_ファイル削除してtmpからコピー
posFiles.forEach(f => fs.unlinkSync(path.join(imgDir, f)));
const tmpFiles = fs.readdirSync(tmpDir);
tmpFiles.forEach(f => {
  fs.renameSync(path.join(tmpDir, f), path.join(imgDir, f));
});
fs.rmdirSync(tmpDir);

console.log(`\nRenamed: ${renamed}, Unmapped: ${unmapped}`);
console.log(`Final files: ${fs.readdirSync(imgDir).filter(f => f.endsWith('.png')).length}`);

// 検証サンプル
console.log('\n=== Sample ===');
['001', '004', '007', '079', '079-usuiro', '108', '108-kokemushi'].forEach(slug => {
  const exists = fs.existsSync(path.join(imgDir, slug + '.png'));
  const p = data.pokemon.find(x => x.slug === slug);
  console.log(`${slug}: ${exists ? 'OK' : 'MISSING'} → ${p ? p.name + (p.variant ? '(' + p.variant + ')' : '') : '???'}`);
});
