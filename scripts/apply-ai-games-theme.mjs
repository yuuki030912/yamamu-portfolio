import { readFile, writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const themeVersion = "20260722-2";
const portalPath = new URL("ai-games/index.html", root);
const playDir = new URL("ai-games/play/", root);
const playPaths = readdirSync(playDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => new URL(entry.name, playDir));

const header = `<header class="site-head">
    <div class="head-inner">
      <a href="/" class="logo yamamu-logo" aria-label="やまむー ホーム"><span class="brand-mark">Y</span><span class="brand-copy">YAMAMU<small>PLAYGROUND</small></span></a>
      <nav class="head-nav" aria-label="メインナビゲーション">
        <a href="/guides">攻略</a>
        <a href="/games" aria-current="page">ゲーム</a>
        <a href="/service">サイト制作</a>
        <a href="/about">ABOUT</a>
      </nav>
      <a class="header-youtube" href="https://www.youtube.com/@yamamu?sub_confirmation=1" target="_blank" rel="noopener">YouTube</a>
    </div>
  </header>`;

async function updatePage(path, { bodyClass, stylesheet }) {
  const original = await readFile(path, "utf8");
  let html = original;

  const escapedStylesheet = stylesheet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const themeLink = new RegExp(`href="${escapedStylesheet}(?:\\?v=[^"]*)?"`);
  if (themeLink.test(html)) {
    html = html.replace(themeLink, `href="${stylesheet}?v=${themeVersion}"`);
  } else {
    html = html.replace("</head>", `  <link rel="stylesheet" href="${stylesheet}?v=${themeVersion}">\n</head>`);
  }

  html = html.replace(/<body(?:\s+class="[^"]*")?>/, `<body class="${bodyClass}">`);
  html = html.replace(/<header class="site-head">[\s\S]*?<\/header>/, header);

  if (html === original) {
    console.log(`Already current: ${path.pathname}`);
    return;
  }

  await writeFile(path, html, "utf8");
  console.log(`Updated: ${path.pathname}`);
}

await updatePage(portalPath, { bodyClass: "ai-portal-page", stylesheet: "theme.css" });
for (const path of playPaths) {
  await updatePage(path, { bodyClass: "ai-game-page", stylesheet: "../theme.css" });
}

console.log(`Applied the shared theme to 1 portal and ${playPaths.length} play pages.`);
