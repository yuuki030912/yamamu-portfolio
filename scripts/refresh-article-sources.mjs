// 既存のポケポケ／パルワールド記事へ、YouTubeの正式な動画説明文を
// 非表示の一次情報として保存する。GitHub-hosted runner からYouTubeが
// ブロックされても、記事生成時に事実の根拠を失わないための補助スクリプト。

import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { extractWatchDescription } from "./enrich-video-article.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GAME_DIRS = ["palworld", "pokepoke"];

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function sourceSection(description) {
  const paragraphs = description.split("\n").map((line) => line.trim()).filter(Boolean)
    .map((line) => `    <p>${escapeHtml(line)}</p>`).join("\n");
  return `  <section class="draft-src" hidden data-article-source="youtube-description">\n${paragraphs}\n  </section>`;
}

async function fetchDescription(videoId) {
  const response = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
    signal: AbortSignal.timeout(30_000),
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`YouTube ${response.status}`);
  return extractWatchDescription(await response.text());
}

let changed = 0;
for (const dir of GAME_DIRS) {
  for (const file of await readdir(join(ROOT, dir))) {
    if (!/^video-.*\.html$/.test(file)) continue;
    const path = join(ROOT, dir, file);
    let html = await readFile(path, "utf8");
    const videoId = html.match(/data-video-id="([^"]+)"/)?.[1];
    if (!videoId) continue;
    try {
      const description = await fetchDescription(videoId);
      if (!description) throw new Error("説明文が見つかりません");
      const section = sourceSection(description);
      if (/<section class="draft-src"[^>]*>[\s\S]*?<\/section>/.test(html)) {
        html = html.replace(/<section class="draft-src"[^>]*>[\s\S]*?<\/section>/, section);
      } else {
        html = html.replace(/\s*<footer class="footer">/, `\n\n${section}\n\n  <footer class="footer">`);
      }
      await writeFile(path, html, "utf8");
      changed += 1;
      console.log(`更新: ${relative(ROOT, path)} (${description.replace(/\s/g, "").length}文字)`);
    } catch (error) {
      console.warn(`失敗: ${dir}/${file}: ${error.message}`);
    }
  }
}

console.log(`一次情報を${changed}記事へ保存しました。`);
