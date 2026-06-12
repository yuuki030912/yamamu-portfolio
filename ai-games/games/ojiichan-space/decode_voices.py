import json, base64, os

src = r"C:\Users\yamau\Downloads\voices_export.json"
dst = os.path.join(os.path.dirname(__file__), "assets", "voices")
os.makedirs(dst, exist_ok=True)

with open(src, encoding="utf-8") as f:
    data = json.load(f)

for fname, b64 in data.items():
    out = os.path.join(dst, fname + ".mp3")
    with open(out, "wb") as f:
        f.write(base64.b64decode(b64))
    size = os.path.getsize(out)
    print(f"  {fname}.mp3  ({size//1024}KB)")

print(f"\n完了: {len(data)}ファイル → {dst}")
