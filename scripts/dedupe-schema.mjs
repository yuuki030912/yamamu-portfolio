#!/usr/bin/env node
/**
 * dedupe-schema.mjs — 同じ @type のJSON-LDノードが複数あるページから重複を取り除く。
 *
 *   node scripts/dedupe-schema.mjs [--dry]
 *
 * 先に出てくるブロックを正とし、後続ブロックの重複ノードだけ落とす。
 * ノードが全部消えたブロックは <script> ごと削除する。
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");
const RE = /(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/g;

function walk(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    if (n.startsWith(".") || n === "node_modules") continue;
    const p = join(dir, n);
    statSync(p).isDirectory() ? walk(p, acc) : n.endsWith(".html") && acc.push(p);
  }
  return acc;
}

let changed = 0;
for (const abs of walk(ROOT)) {
  const html = readFileSync(abs, "utf8");
  const seen = new Set();
  let removed = [];
  const out = html.replace(RE, (full, open, raw, close) => {
    let data;
    try { data = JSON.parse(raw); } catch { return full; }
    const nodes = data["@graph"] || [data];
    const kept = [];
    for (const n of nodes) {
      const t = n["@type"];
      if (t && seen.has(t)) { removed.push(t); continue; }
      if (t) seen.add(t);
      kept.push(n);
    }
    if (!kept.length) return "";                       // ブロックごと削除
    if (kept.length === nodes.length) return full;     // 変更なし
    const body = data["@graph"]
      ? JSON.stringify({ "@context": data["@context"] || "https://schema.org", "@graph": kept }, null, 2)
      : JSON.stringify(kept[0], null, 2);
    return open + "\n" + body.split("\n").map((l) => "  " + l).join("\n") + "\n  " + close;
  });
  if (removed.length) {
    if (!DRY) writeFileSync(abs, out, "utf8");
    changed++;
    console.log(`  ✓ ${relative(ROOT, abs)}  重複除去: ${removed.join(", ")}`);
  }
}
console.log(`\n${DRY ? "[dry-run] " : ""}${changed}ページを修正`);
