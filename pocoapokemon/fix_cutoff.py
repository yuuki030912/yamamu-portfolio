# -*- coding: utf-8 -*-
"""
Re-extract 61 pokemon images that were cut off at edges.
Uses larger crop (CROP_HALF=80) then resizes to 130x130.
For yellow-circle selected pokemon, replaces yellow bg with grey.
"""
import json, sys, os
from PIL import Image
import numpy as np
from scipy.signal import find_peaks
sys.stdout.reconfigure(encoding='utf-8')

# ── Config ──
IMG_DIR = 'C:/Users/yamau/Downloads/MyCluade/pocoapokemon/img/pokemon'
DATA_FILE = 'C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokemon-data.json'
CROP_HALF = 80          # larger crop to avoid cutoff (was 65)
FINAL_SIZE = 130        # resize to match existing images
ROW_YS = [310, 460, 620, 780]

# ── Screenshots ──
SS_FILES = [
    ('E:/videos/Screenshot 2026-03-23 13-32-39.png',  1),    # SS0: sel=001
    ('E:/videos/Screenshot 2026-03-23 20-16-05.png',  34),   # SS1: sel=034
    ('E:/videos/Screenshot 2026-03-23 20-16-20.png',  66),   # SS2: sel=066
    ('E:/videos/Screenshot 2026-03-23 20-16-25.png',  98),   # SS3: sel=098
    ('E:/videos/Screenshot 2026-03-23 20-16-31.png',  130),  # SS4: sel=130
    ('E:/videos/Screenshot 2026-03-23 20-16-38.png',  162),  # SS5: sel=162
    ('E:/videos/Screenshot 2026-03-23 20-16-42.png',  194),  # SS6: sel=194
    ('E:/videos/Screenshot 2026-03-23 20-16-46.png',  226),  # SS7: sel=226
    ('E:/videos/Screenshot 2026-03-23 20-16-50.png',  258),  # SS8: sel=258
    ('E:/videos/Screenshot 2026-03-23 20-16-58.png',  290),  # SS9: sel=290
]

# Special: SS10 for dex001 with ピジョット, and separate screenshot for ハネッコ(301)
SS10_FILE = 'E:/videos/Screenshot 2026-03-25 15-08-26.png'  # sel=001
SS_HANECCO = 'E:/videos/Screenshot 2026-03-25 15-03-06.png'  # ハネッコ in yellow circle

# ── 61 target images to fix ──
TARGETS = {3,6,15,23,25,26,28,29,30,34,41,66,67,76,83,105,106,110,116,122,124,
           130,131,137,140,144,158,162,175,187,190,194,208,210,211,215,226,230,
           233,234,239,241,244,250,253,258,259,262,265,270,277,279,281,289,290,
           292,293,296,297,298,301}

# Selected pokemon that are in yellow circles (need bg replacement)
YELLOW_SELECTED = {34, 66, 98, 130, 162, 194, 226, 258, 290, 301}

# ── Load pokemon data and build grid order ──
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    pd = json.load(f)

entries = sorted(pd['pokemon'], key=lambda x: (x['dexNumber'], x.get('slug', '')))
grid_entries = []
for p in entries:
    slug = p.get('slug', '')
    dex = p['dexNumber']
    if dex == 12: continue          # ピジョット unregistered
    if slug == '041-hakase': continue  # variant
    if dex == 145: continue           # シャリタツ unregistered
    grid_entries.append(p)

# Insert missing dex numbers (in game grid but not in JSON)
final_grid = []
added_extras = set()
for p in grid_entries:
    dex = p['dexNumber']
    for missing_dex in [73, 141, 182]:
        if missing_dex not in added_extras and missing_dex < dex:
            final_grid.append({'dexNumber': missing_dex, 'slug': f'{missing_dex:03d}', 'name': f'[MISSING {missing_dex}]'})
            added_extras.add(missing_dex)
    final_grid.append(p)
for missing_dex in [73, 141, 182]:
    if missing_dex not in added_extras:
        final_grid.append({'dexNumber': missing_dex, 'slug': f'{missing_dex:03d}', 'name': f'[MISSING {missing_dex}]'})

print(f'Grid entries: {len(final_grid)}')

# Build grid_index -> dexNumber mapping, and find selected positions
# Map each dexNumber to its grid index (use first occurrence for base entries)
dex_to_grid_idx = {}
for gi, p in enumerate(final_grid):
    dex = p['dexNumber']
    if dex not in dex_to_grid_idx:
        dex_to_grid_idx[dex] = gi

# Find grid indices for each screenshot's selected pokemon
ss_sel_grid_idx = []
for ss_file, sel_dex in SS_FILES:
    gi = dex_to_grid_idx[sel_dex]
    ss_sel_grid_idx.append(gi)

print(f'Screenshot start grid indices: {ss_sel_grid_idx}')

# ── Peak detection for pokemon centers ──
def find_pokemon_centers(img, y_center):
    """Find x-coordinates of pokemon centers in a row."""
    strip = np.array(img.crop((250, y_center - 30, 1600, y_center + 30)))
    avg_per_x = strip.mean(axis=0).mean(axis=1)
    inverted = -avg_per_x
    peaks, _ = find_peaks(inverted, distance=100, height=-235, prominence=3)
    return [250 + p for p in peaks]

def replace_yellow_with_grey(crop_img):
    """Replace yellow/golden circle background with grey (240,240,240)."""
    arr = np.array(crop_img).astype(float)
    # Yellow pixels: high R, high G, low-ish B
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    # Yellow mask: R > 180, G > 150, B < 120, and R-B > 80
    yellow_mask = (r > 170) & (g > 140) & (b < 130) & ((r - b) > 70)
    # Also catch darker gold: R > 140, G > 110, B < 90
    gold_mask = (r > 130) & (g > 100) & (b < 100) & ((r - b) > 50) & ((r + g) > 260)
    combined_mask = yellow_mask | gold_mask
    arr[combined_mask] = [240, 240, 240]
    return Image.fromarray(arr.astype(np.uint8))

def extract_and_save(img, cx, cy, dex_num, is_selected=False):
    """Extract pokemon crop, optionally replace yellow bg, resize and save."""
    # Crop with larger area
    left = cx - CROP_HALF
    top = cy - CROP_HALF
    right = cx + CROP_HALF
    bottom = cy + CROP_HALF

    # Clamp to image bounds
    img_w, img_h = img.size
    left = max(0, left)
    top = max(0, top)
    right = min(img_w, right)
    bottom = min(img_h, bottom)

    crop = img.crop((left, top, right, bottom))

    # If selected (yellow circle), replace yellow bg
    if is_selected:
        crop = replace_yellow_with_grey(crop)

    # Resize to final size
    crop = crop.resize((FINAL_SIZE, FINAL_SIZE), Image.LANCZOS)

    # Save
    out_path = os.path.join(IMG_DIR, f'{dex_num:03d}.png')
    crop.save(out_path)
    return out_path

# ── For each target, determine screenshot and extract ──
extracted = {}
errors = []

for target_dex in sorted(TARGETS):
    if target_dex == 301:
        continue  # Handle separately

    # Find grid index for this target
    grid_idx = dex_to_grid_idx.get(target_dex)
    if grid_idx is None:
        errors.append(f'dex{target_dex:03d}: not found in grid')
        continue

    # Determine which screenshot contains this grid position
    ss_idx = None
    offset = None
    for si in range(len(ss_sel_grid_idx) - 1, -1, -1):
        if grid_idx >= ss_sel_grid_idx[si]:
            off = grid_idx - ss_sel_grid_idx[si]
            if off < 32:
                ss_idx = si
                offset = off
            break

    if ss_idx is None:
        errors.append(f'dex{target_dex:03d}: no screenshot found (grid_idx={grid_idx})')
        continue

    ss_file, sel_dex = SS_FILES[ss_idx]
    is_selected = (offset == 0)

    # Open screenshot
    img = Image.open(ss_file)

    # Find centers for all rows
    all_centers = []
    yellow_center_x = None
    for ri, y in enumerate(ROW_YS):
        centers_x = find_pokemon_centers(img, y)
        if ri == 0 and len(centers_x) > 0:
            yellow_center_x = centers_x[0]
            # Row 0: first is selected, rest are grid items
            for cx in centers_x[1:]:
                all_centers.append((cx, y))
        else:
            for cx in centers_x:
                all_centers.append((cx, y))

    if is_selected:
        # This is the yellow circle pokemon
        if yellow_center_x is None:
            errors.append(f'dex{target_dex:03d}: could not find yellow center in SS{ss_idx}')
            continue
        if target_dex in YELLOW_SELECTED:
            path = extract_and_save(img, yellow_center_x, ROW_YS[0], target_dex, is_selected=True)
        else:
            path = extract_and_save(img, yellow_center_x, ROW_YS[0], target_dex, is_selected=False)
        extracted[target_dex] = f'SS{ss_idx} SELECTED'
    else:
        # Grid item at offset-1 (0-indexed from grid items, since offset=0 is selected)
        grid_item_idx = offset - 1
        if grid_item_idx >= len(all_centers):
            errors.append(f'dex{target_dex:03d}: grid_item_idx={grid_item_idx} >= {len(all_centers)} centers in SS{ss_idx}')
            continue
        cx, cy = all_centers[grid_item_idx]
        path = extract_and_save(img, cx, cy, target_dex, is_selected=False)
        extracted[target_dex] = f'SS{ss_idx} grid[{grid_item_idx}] ({cx},{cy})'

# ── Handle dex301 ハネッコ separately ──
if 301 in TARGETS:
    # From E:/videos/Screenshot 2026-03-25 15-03-06.png, yellow circle at ~(328, 342)
    img301 = Image.open(SS_HANECCO)
    # Try to find it with peak detection first
    centers_x = find_pokemon_centers(img301, ROW_YS[0])
    if centers_x:
        cx301 = centers_x[0]  # First one should be yellow circle
        print(f'dex301 ハネッコ: detected center at x={cx301}')
        path = extract_and_save(img301, cx301, ROW_YS[0], 301, is_selected=True)
        extracted[301] = f'SS_HANECCO SELECTED ({cx301},{ROW_YS[0]})'
    else:
        # Fallback: use approximate position
        cx301 = 328
        cy301 = 342
        print(f'dex301 ハネッコ: using fallback position ({cx301},{cy301})')
        path = extract_and_save(img301, cx301, cy301, 301, is_selected=True)
        extracted[301] = f'SS_HANECCO fallback ({cx301},{cy301})'

# ── Report ──
print(f'\n=== Results ===')
print(f'Extracted: {len(extracted)}/{len(TARGETS)}')
for dex in sorted(extracted.keys()):
    name = ''
    for p in final_grid:
        if p['dexNumber'] == dex:
            name = p['name']
            break
    print(f'  dex{dex:03d} {name:12s} <- {extracted[dex]}')

if errors:
    print(f'\nErrors ({len(errors)}):')
    for e in errors:
        print(f'  {e}')

# Verify all targets exist
print(f'\n=== Verification ===')
missing = []
for t in sorted(TARGETS):
    path = os.path.join(IMG_DIR, f'{t:03d}.png')
    if os.path.exists(path):
        size = Image.open(path).size
        print(f'  {t:03d}.png: {size[0]}x{size[1]} OK')
    else:
        missing.append(t)
        print(f'  {t:03d}.png: MISSING')

if missing:
    print(f'\nStill missing: {missing}')
else:
    print(f'\nAll {len(TARGETS)} images extracted successfully!')
