#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Re-extract ALL pokemon images from game screenshots using correct grid ordering.
"""

import json
import os
import glob
import numpy as np
from PIL import Image
from scipy.signal import find_peaks

# === Configuration ===
DATA_FILE = r"C:\Users\yamau\Downloads\MyCluade\pocoapokemon\pokemon-data.json"
OUTPUT_DIR = r"C:\Users\yamau\Downloads\MyCluade\pocoapokemon\img\pokemon"
CROP_HALF = 80  # 160x160 crop
RESIZE = 130    # Final size

# Screenshot files (SS0..SS9) and their selected pokemon slugs
SCREENSHOTS = [
    (r"E:\videos\Screenshot 2026-03-23 13-32-39.png", "001"),
    (r"E:\videos\Screenshot 2026-03-23 20-16-05.png", "034"),
    (r"E:\videos\Screenshot 2026-03-23 20-16-20.png", "066"),
    (r"E:\videos\Screenshot 2026-03-23 20-16-25.png", "098"),
    (r"E:\videos\Screenshot 2026-03-23 20-16-31.png", "130"),
    (r"E:\videos\Screenshot 2026-03-23 20-16-38.png", "162"),
    (r"E:\videos\Screenshot 2026-03-23 20-16-42.png", "194"),  # トロッゴン
    (r"E:\videos\Screenshot 2026-03-23 20-16-46.png", "226"),  # バクフーン
    (r"E:\videos\Screenshot 2026-03-23 20-16-50.png", "258"),  # アオガラス
    (r"E:\videos\Screenshot 2026-03-23 20-16-58.png", "274"),  # タテトプス
]

ROW_YS = [310, 460, 620, 780]
UNREGISTERED = {'012', '041-hakase', '145', '145-sotta', '145-tareta', '145-nobita'}


def build_grid_order(data):
    """Build the 300-entry grid order from pokemon-data.json."""
    pokemon_list = data['pokemon']
    filtered = [p for p in pokemon_list if p['slug'] not in UNREGISTERED]

    seen = set()
    deduped = []
    for p in filtered:
        key = (p['dexNumber'], p['name'])
        if key not in seen:
            seen.add(key)
            deduped.append(p)

    def sort_key(p):
        slug = p['slug']
        if slug.endswith('b'):
            priority = 0
        elif '-' in slug:
            priority = 1
        else:
            priority = 2
        return (p['dexNumber'], priority, slug)

    deduped.sort(key=sort_key)
    return deduped


def find_centers_in_row(img, y, expected_count, x_start=250, x_end=1600):
    """Find pokemon icon centers in a row using brightness peaks."""
    strip = np.array(img.crop((x_start, y - 30, x_end, y + 30)))
    avg = strip.mean(axis=0).mean(axis=1)
    peaks, props = find_peaks(-avg, distance=100, height=-235, prominence=3)

    if len(peaks) > expected_count:
        # Take the most prominent peaks, re-sort by position
        prominences = props['prominences']
        idx_sorted = np.argsort(-prominences)[:expected_count]
        peaks = np.sort(peaks[idx_sorted])

    centers = [x_start + int(p) for p in peaks]
    return centers


def extract_pokemon(img, cx, cy, is_selected=False):
    """Extract and resize a pokemon icon from the screenshot."""
    left = cx - CROP_HALF
    top = cy - CROP_HALF
    right = cx + CROP_HALF
    bottom = cy + CROP_HALF

    cropped = img.crop((left, top, right, bottom))

    if is_selected:
        arr = np.array(cropped)
        yellow_mask = (arr[:, :, 0] > 200) & (arr[:, :, 1] > 180) & (arr[:, :, 2] < 100)
        arr[yellow_mask] = [240, 240, 240]
        cropped = Image.fromarray(arr)

    resized = cropped.resize((RESIZE, RESIZE), Image.LANCZOS)
    return resized


def main():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    grid = build_grid_order(data)
    print(f"Grid entries: {len(grid)}")

    for i, p in enumerate(grid[:10]):
        print(f"  Grid[{i}]: slug={p['slug']} dex={p['dexNumber']} name={p['name']}")

    slug_to_idx = {p['slug']: i for i, p in enumerate(grid)}

    # Clean ALL existing images
    removed = 0
    for f in os.listdir(OUTPUT_DIR):
        if f.endswith('.png'):
            os.remove(os.path.join(OUTPUT_DIR, f))
            removed += 1
    print(f"Removed {removed} existing images")

    saved = set()

    for ss_num, (ss_path, selected_slug) in enumerate(SCREENSHOTS):
        print(f"\n=== SS{ss_num}: {os.path.basename(ss_path)} ===")

        if selected_slug not in slug_to_idx:
            print(f"  ERROR: slug '{selected_slug}' not found!")
            continue

        selected_idx = slug_to_idx[selected_slug]
        print(f"  Selected: grid[{selected_idx}] = {grid[selected_idx]['name']} (slug={selected_slug})")

        remaining = len(grid) - selected_idx - 1
        grid_items_count = min(31, remaining)

        # Calculate expected items per row
        # Row0: 1 selected + up to 7 grid items
        # Row1: up to 8
        # Row2: up to 8
        # Row3: up to 8
        row_expected = [0, 0, 0, 0]
        assigned = 0
        row_expected[0] = min(7, grid_items_count)
        assigned = row_expected[0]
        for r in range(1, 4):
            row_expected[r] = min(8, grid_items_count - assigned)
            if row_expected[r] < 0:
                row_expected[r] = 0
            assigned += row_expected[r]

        img = Image.open(ss_path)

        # Collect all (cx, cy) pairs in order
        positions = []  # list of (cx, cy)

        for row_num, y in enumerate(ROW_YS):
            if row_num == 0:
                exp = 1 + row_expected[0]  # +1 for selected
            else:
                exp = row_expected[row_num]

            if exp == 0:
                print(f"  Row{row_num}: skip (0 expected)")
                continue

            centers = find_centers_in_row(img, y, exp)
            actual = len(centers)
            print(f"  Row{row_num}: {actual}/{exp} centers")

            for cx in centers:
                positions.append((cx, y))

        # Map positions to grid entries
        # positions[0] = selected pokemon (grid[selected_idx])
        # positions[1] = grid[selected_idx + 1]
        # positions[2] = grid[selected_idx + 2]
        # ...

        extracted_count = 0
        for i, (cx, cy) in enumerate(positions):
            grid_idx = selected_idx + i
            if grid_idx >= len(grid):
                break

            is_selected = (i == 0)
            entry = grid[grid_idx]

            if grid_idx in saved:
                continue

            pokemon_img = extract_pokemon(img, cx, cy, is_selected)
            out_path = os.path.join(OUTPUT_DIR, f"{entry['name']}.png")
            pokemon_img.save(out_path)
            saved.add(grid_idx)
            extracted_count += 1

        print(f"  Extracted: {extracted_count}, Cumulative: {len(saved)}")

    print(f"\n=== DONE ===")
    print(f"Total saved: {len(saved)} / {len(grid)}")

    missing = [(i, grid[i]['slug'], grid[i]['name']) for i in range(len(grid)) if i not in saved]
    if missing:
        print(f"\nMissing ({len(missing)}):")
        for idx, slug, name in missing:
            print(f"  Grid[{idx}]: {slug} ({name})")

    # Verify file count
    files = [f for f in os.listdir(OUTPUT_DIR) if f.endswith('.png')]
    print(f"\nFiles in output dir: {len(files)}")


if __name__ == '__main__':
    main()
