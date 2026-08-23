# -*- coding: utf-8 -*-
import json, sys, os
from PIL import Image
import numpy as np
from scipy.signal import find_peaks
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokemon-data.json','r',encoding='utf-8') as f:
    pd = json.load(f)

# Build registered list with CORRECTED dex numbers
pokemon_list = pd['pokemon']
reg_seen = set()
registered = []
for p in sorted(pokemon_list, key=lambda x: (x['dexNumber'], x.get('slug',''))):
    if p['dexNumber'] not in reg_seen and p['dexNumber'] != 12:
        reg_seen.add(p['dexNumber'])
        registered.append(p)
registered.sort(key=lambda x: x['dexNumber'])

dex_name = {p['dexNumber']: p['name'] for p in registered}
reg_dex = [p['dexNumber'] for p in registered]
print(f'Registered: {len(registered)}')

img_dir = 'C:/Users/yamau/Downloads/MyCluade/pocoapokemon/img/pokemon'
CROP_HALF = 65
ROW_YS = [310, 460, 620, 780]

def find_pokemon_centers(img, y_center):
    strip = np.array(img.crop((250, y_center-30, 1600, y_center+30)))
    avg_per_x = strip.mean(axis=0).mean(axis=1)
    inverted = -avg_per_x
    peaks, _ = find_peaks(inverted, distance=100, height=-235, prominence=3)
    return [250 + p for p in peaks]

selected_dexes = [34, 66, 98, 130, 162, 194, 226, 258, 274]
ss_files = [
    'E:/videos/Screenshot 2026-03-23 20-16-05.png',
    'E:/videos/Screenshot 2026-03-23 20-16-20.png',
    'E:/videos/Screenshot 2026-03-23 20-16-25.png',
    'E:/videos/Screenshot 2026-03-23 20-16-31.png',
    'E:/videos/Screenshot 2026-03-23 20-16-38.png',
    'E:/videos/Screenshot 2026-03-23 20-16-42.png',
    'E:/videos/Screenshot 2026-03-23 20-16-46.png',
    'E:/videos/Screenshot 2026-03-23 20-16-50.png',
    'E:/videos/Screenshot 2026-03-23 20-16-58.png',
]

already_extracted = set()
total = 0

for si in range(len(ss_files)):
    ss_file = ss_files[si]
    sel_dex = selected_dexes[si]
    img = Image.open(ss_file)

    sel_pos = reg_dex.index(sel_dex)
    grid_dexes = reg_dex[sel_pos + 1:]

    all_grid_centers = []
    yellow_center = None
    for ri, y in enumerate(ROW_YS):
        centers = find_pokemon_centers(img, y)
        if ri == 0 and len(centers) > 0:
            yellow_center = centers[0]
            for cx in centers[1:]:
                all_grid_centers.append((cx, y))
        else:
            for cx in centers:
                all_grid_centers.append((cx, y))

    # Extract selected
    if sel_dex not in already_extracted and sel_dex > 33 and yellow_center:
        crop = img.crop((yellow_center - CROP_HALF, ROW_YS[0] - CROP_HALF,
                         yellow_center + CROP_HALF, ROW_YS[0] + CROP_HALF))
        crop.save(os.path.join(img_dir, f'{sel_dex:03d}.png'))
        already_extracted.add(sel_dex)
        total += 1

    # Extract grid
    n = min(len(grid_dexes), len(all_grid_centers))
    for idx in range(n):
        dex = grid_dexes[idx]
        if dex in already_extracted or dex <= 33:
            already_extracted.add(dex)
            continue
        cx, cy = all_grid_centers[idx]
        crop = img.crop((cx - CROP_HALF, cy - CROP_HALF, cx + CROP_HALF, cy + CROP_HALF))
        crop.save(os.path.join(img_dir, f'{dex:03d}.png'))
        already_extracted.add(dex)
        total += 1

print(f'Extracted: {total}')

# Verify key images
check_dexes = [70, 71, 72, 73, 141, 152, 176, 177, 178, 179, 180, 181, 182]
for dex in check_dexes:
    exists = os.path.exists(os.path.join(img_dir, f'{dex:03d}.png'))
    name = dex_name.get(dex, '?')
    status = "OK" if exists else "MISSING"
    src = "(extracted)" if dex in already_extracted else "(old)"
    print(f'  {dex:03d} {name}: {status} {src}')

# Total image count
all_imgs = [f for f in os.listdir(img_dir) if f.endswith('.png') and f[:-4].isdigit()]
print(f'\nTotal images: {len(all_imgs)}')
