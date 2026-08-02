#!/usr/bin/env python3
"""
ポケモン図鑑スクリーンショットからポケモンアイコンを一括トリミング
使い方: python pocoapokemon/crop-pokemon.py
出力: pocoapokemon/img/pokemon/pos_001.png ~ pos_NNN.png (位置番号)
"""
from PIL import Image
import numpy as np
import os

SCREENSHOTS = [f'C:/Users/yamau/Downloads/IMG_09{i}.JPG' for i in range(22, 33)]
OUT_DIR = os.path.join(os.path.dirname(__file__), 'img', 'pokemon')
os.makedirs(OUT_DIR, exist_ok=True)

CROP_SIZE = 65
OUTPUT_SIZE = 96

# 安定した7列のX中心(全スクショ共通)
STABLE_COLS = [537, 701, 865, 1029, 1193, 1357, 1521]
# 行Y中心
DEFAULT_ROWS = [286, 446, 606, 766]

# 背景色(灰色)に置換する色
BG_COLOR = (240, 240, 240)


def detect_rows(img_path):
    """行Y中心を自動検出"""
    arr = np.array(Image.open(img_path))
    rows = []
    in_c = False
    sy = 0
    for y in range(150, 950):
        r, g, b = int(arr[y, 1460, 0]), int(arr[y, 1460, 1]), int(arr[y, 1460, 2])
        if (r <= 238 and b >= r + 1) and not in_c:
            sy = y
            in_c = True
        elif (r >= 239 and g >= 239) and in_c:
            if y - sy > 50:
                rows.append((sy + y - 1) // 2)
            in_c = False
    return rows if rows else DEFAULT_ROWS


def crop_icon(img, cx, cy):
    """ポケモンアイコンを切り出してリサイズ、背景を統一"""
    w, h = img.size
    left = max(0, cx - CROP_SIZE)
    top = max(0, cy - CROP_SIZE)
    right = min(w, cx + CROP_SIZE)
    bottom = min(h, cy + CROP_SIZE)

    crop = img.crop((left, top, right, bottom))
    crop = crop.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.LANCZOS)
    return crop


def remove_yellow_bg(img_crop):
    """選択中ポケモンの黄色い背景を灰色に置換"""
    arr = np.array(img_crop)
    # 黄色の検出: R>180, G>160, B<120
    yellow_mask = (arr[:, :, 0] > 180) & (arr[:, :, 1] > 160) & (arr[:, :, 2] < 120)
    arr[yellow_mask] = BG_COLOR
    return Image.fromarray(arr)


def is_empty_cell(arr, cx, cy):
    """空のセル判定"""
    h, w = arr.shape[:2]
    y1, y2 = max(0, cy - 30), min(h, cy + 30)
    x1, x2 = max(0, cx - 30), min(w, cx + 30)
    region = arr[y1:y2, x1:x2]
    if region.size == 0:
        return True
    # 背景色(236,235,241)や(240,240,240)から大きく外れるピクセルがあればポケモンがいる
    non_bg = (region[:, :, 0] < 225) | (region[:, :, 1] < 225) | (region[:, :, 2] < 225)
    return non_bg.sum() < 10  # 暗いピクセルが10未満なら空


def find_selected_center(arr):
    """選択中ポケモンの黄色い円の中心を検出"""
    yellow = (arr[:, :, 0] > 200) & (arr[:, :, 1] > 180) & (arr[:, :, 2] < 100)
    ys, xs = np.where(yellow)
    if len(xs) == 0:
        return None, None
    return int(xs.mean()), int(ys.mean())


# メイン処理
print('ポケモン図鑑画像トリミング開始...\n')
total = 0
pos_counter = 1  # 1-based position counter across all screenshots

for ss_idx, ss_path in enumerate(SCREENSHOTS):
    if not os.path.exists(ss_path):
        print(f'  SKIP: {ss_path}')
        continue

    img = Image.open(ss_path)
    arr = np.array(img)
    rows = detect_rows(ss_path)
    page_start_pos = pos_counter

    print(f'IMG_09{22 + ss_idx}: {len(rows)}行検出, pos_{pos_counter:03d}~')

    # グリッド内のポケモン順序: 行優先(上→下、左→右)
    # 選択中=1匹目(1行目1列目)、グリッド=残り27匹
    # 1行目: [選択中, c1, c2, c3, c4, c5, c6] → 7匹 (c0は選択中と重複)
    # 2行目: [c0, c1, c2, c3, c4, c5, c6] → 7匹
    # ...

    # ページ内での位置 → 図鑑番号のマッピング
    # pos 0 = 選択中(1行目の最初)
    # pos 1-7 = 1行目のグリッド7列
    # pos 8-14 = 2行目の7列 (ここでは1列目から)
    # ...

    # 実際の配置:
    # 1行目: 選択枠(=pos0) + グリッド7列(=pos1-7)  → 8匹
    # 2行目: グリッド7列(=pos8-14)  → しかし8列検出のスクショあり
    # → 1列目のポケモンも検出されている場合がある

    # シンプル化: 1ページ28匹固定
    # 1ページ = 28匹
    # 選択中 = 1行目1列目のポケモン（黄色円で表示）
    # グリッド1行目: 2-7列目 = 6匹（1列目は選択で隠れている）
    # グリッド2-4行目: 7列×3行 = 21匹
    # 合計: 1 + 6 + 21 = 28匹

    # 1. 選択中のポケモン（= 1行目1列目）
    sel_x, sel_y = find_selected_center(arr)
    if sel_x is not None:
        crop = crop_icon(img, sel_x, sel_y)
        crop = remove_yellow_bg(crop)
        fname = f'pos_{pos_counter:03d}.png'
        crop.save(os.path.join(OUT_DIR, fname))
        print(f'  {fname} (選択中)')
        total += 1
    else:
        print(f'  pos_{pos_counter:03d} - 選択ポケモン検出失敗')
    pos_counter += 1

    # 2. グリッドのポケモン
    for row_idx, ry in enumerate(rows):
        cols_for_row = STABLE_COLS if row_idx > 0 else STABLE_COLS[1:]  # 1行目は2列目から(1列目=選択中)
        for cx in cols_for_row:
            if is_empty_cell(arr, cx, ry):
                pos_counter += 1
                continue

            crop = crop_icon(img, cx, ry)
            fname = f'pos_{pos_counter:03d}.png'
            crop.save(os.path.join(OUT_DIR, fname))
            total += 1
            pos_counter += 1

    print(f'  → このページ: {pos_counter - page_start_pos}匹処理')

print(f'\n=== 完了: {total}枚保存 ({OUT_DIR}) ===')
print(f'位置番号: pos_001 ~ pos_{pos_counter-1:03d}')
