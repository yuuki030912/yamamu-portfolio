import { readFile, writeFile } from "node:fs/promises";

const channelId = "UCZoSz5BvUCPaFP7BPUKZVUQ";
const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
const indexPath = new URL("../index.html", import.meta.url);

function decodeXml(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function videoTag(title) {
  if (/パルワールド|palworld/i.test(title)) return "PALWORLD";
  if (/ポケポケ|ポケモン|pok[eé]mon/i.test(title)) return "POKÉPOKE";
  if (/イナズマ|inazuma/i.test(title)) return "INAZUMA V";
  return "NEW VIDEO";
}

function parseFeed(xml) {
  return (xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []).slice(0, 3).flatMap((entry) => {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const rawTitle = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    if (!id || !rawTitle) return [];
    const title = decodeXml(rawTitle.trim());
    return [{ id, title, tag: videoTag(title) }];
  });
}

function renderVideos(videos) {
  return `<div class="video-grid">${videos.map((video, index) => {
    const title = escapeHtml(video.title);
    return `<a class="video-card" href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noreferrer"><div class="video-image"><img src="https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg" alt="${title}"/><span class="play-button">▶</span><span class="video-index">0${index + 1}</span></div><div class="video-meta"><span>${video.tag}</span><span>YOUTUBE</span></div><h3>${title}</h3></a>`;
  }).join("")}</div>`;
}

const response = await fetch(feedUrl, { headers: { Accept: "application/atom+xml" } });
if (!response.ok) throw new Error(`YouTube feed returned ${response.status}`);

const videos = parseFeed(await response.text());
if (videos.length !== 3) throw new Error("YouTube feed did not contain three videos");

const html = await readFile(indexPath, "utf8");
const sectionStart = html.indexOf('<section class="section videos-section">');
const nextSection = html.indexOf('<section class="about-strip">', sectionStart);
if (sectionStart < 0 || nextSection < 0) throw new Error("Latest videos section was not found");

const section = html.slice(sectionStart, nextSection);
const gridStart = section.indexOf('<div class="video-grid">');
const sectionEnd = section.lastIndexOf("</section>");
if (gridStart < 0 || sectionEnd < 0) throw new Error("Latest videos grid was not found");

const updatedSection = `${section.slice(0, gridStart)}${renderVideos(videos)}${section.slice(sectionEnd)}`;
const updatedHtml = `${html.slice(0, sectionStart)}${updatedSection}${html.slice(nextSection)}`;

if (updatedHtml === html) {
  console.log("Latest videos are already current.");
} else {
  await writeFile(indexPath, updatedHtml, "utf8");
  console.log(`Updated latest videos: ${videos.map(({ id }) => id).join(", ")}`);
}
