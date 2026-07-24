#!/usr/bin/env node
/**
 * publish-draft.mjs — 自動生成された下書き記事を公開状態にする。
 *
 *   node scripts/publish-draft.mjs pokepoke/video-pokepoke-xxx.html [--dry]
 *
 * CLAUDE.md の「仕上げ時に noindex・🚧バナー・元説明文ブロックを外す」を機械化したもの。
 * あわせて、チャプター表に入る定型の埋め草文（重複コンテンツ）も削る。
 * ※ 本文の事実確認（カード名・数値・勝敗）は別途ゲーム画面と突き合わせること。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");
const targets = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!targets.length) {
  console.error("使い方: node scripts/publish-draft.mjs <記事パス...> [--dry]");
  process.exit(2);
}

for (const rel of targets) {
  const abs = join(ROOT, rel.replace(/\\/g, "/"));
  if (!existsSync(abs)) { console.error(`  ! 見つからない: ${rel}`); continue; }
  let html = readFileSync(abs, "utf8");
  const before = html.length;
  const done = [];

  // 1. noindex を外す
  if (/<meta name="robots" content="noindex">/.test(html)) {
    html = html.replace(/\s*<meta name="robots" content="noindex">(<!--[^>]*-->)?/g, "");
    done.push("noindex解除");
  }

  // 2. 🚧下書きバナーを削除
  if (/<div class="draft-banner">/.test(html)) {
    html = html.replace(/\s*<div class="draft-banner">[\s\S]*?<\/div>/, "");
    done.push("バナー削除");
  }

  // 3. 元説明文ブロック（hidden）を削除
  if (/<section class="draft-src"/.test(html)) {
    html = html.replace(/\s*<section class="draft-src"[\s\S]*?<\/section>/, "");
    done.push("元説明文ブロック削除");
  }

  // 4. チャプター表の定型埋め草文を削除（章タイトルは残す）
  const filler = /<br>「[^」]*」の実際の流れを確認できる場面です。プレイ画面や本人の反応まで確かめたい場合は、この時刻から再生してください。/g;
  const n = (html.match(filler) || []).length;
  if (n) { html = html.replace(filler, ""); done.push(`定型文${n}箇所を削除`); }

  // 5. 使わなくなったCSSを掃除
  html = html.replace(/\s*\.draft-(banner|src)[^\n]*\{[^}]*\}/g, "");

  if (!done.length) { console.log(`  = ${rel}: 変更なし（既に公開状態）`); continue; }
  if (!DRY) writeFileSync(abs, html, "utf8");
  console.log(`  ✓ ${rel}\n      ${done.join(" / ")}  (${before} -> ${html.length} bytes)`);
}
console.log(DRY ? "\n[dry-run] 書き込みはしていない" : "\n完了。seo-check.mjs で検証すること。");
