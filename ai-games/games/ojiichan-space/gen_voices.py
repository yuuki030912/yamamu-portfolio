"""
おじいちゃん宇宙大冒険 - Fish Audio TTS 一括生成
"""
import os, time, sys
import requests
import msgpack

TOKEN    = "c9449a2e-1eb0-4427-9ba2-b5ad87a98284"
VOICE_ID = "d537f8f7f83b48abb97f29dd3ea1e7ff"
OUT_DIR  = os.path.join(os.path.dirname(__file__), "assets", "voices")
os.makedirs(OUT_DIR, exist_ok=True)

LINES = [
    ("00_nanjako",   "なんじゃこりゃ！"),
    ("01_mago",      "孫よ、見ておるか？"),
    ("02_koshi",     "腰が…"),
    ("03_nenkin",    "これ年金で払うのか？"),
    ("04_samui",     "宇宙は寒いのう"),
    ("05_ocha",      "お茶が飲みたい"),
    ("06_kaeritai",  "もう帰りたい"),
    ("07_mukashi",   "昔はこんなことしとらん"),
    ("08_wasya",     "わしゃ知らん"),
    ("09_megane",    "眼鏡がないと見えん"),
    ("10_haaa",      "はぁ～"),
    ("11_uwaa",      "うわぁ！"),
    ("12_ganbaru",   "孫が見てるから頑張る！"),
    ("13_eei",       "ええい！"),
    ("14_hii",       "ひぃっ！"),
]

ok = fail = 0
for fname, text in LINES:
    out_path = os.path.join(OUT_DIR, f"{fname}.mp3")
    print(f"  生成中: {text} ...", end=" ", flush=True)

    payload = msgpack.packb({
        "text": text,
        "reference_id": VOICE_ID,
        "format": "mp3",
        "mp3_bitrate": 128,
        "normalize": True,
        "latency": "normal",
    })

    try:
        resp = requests.post(
            "https://api.fish.audio/v1/tts",
            data=payload,
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/msgpack",
            },
            stream=True,
            timeout=30,
        )
        if resp.status_code == 200:
            with open(out_path, "wb") as f:
                for chunk in resp.iter_content(4096):
                    f.write(chunk)
            size = os.path.getsize(out_path)
            print(f"OK ({size//1024}KB)")
            ok += 1
        else:
            print(f"FAILED {resp.status_code}: {resp.text[:80]}")
            fail += 1
    except Exception as e:
        print(f"ERROR: {e}")
        fail += 1

    time.sleep(0.4)

print(f"\n完了: {ok}成功 / {fail}失敗")
print(f"出力先: {OUT_DIR}")
