# -*- coding: utf-8 -*-
import json, sys, os
from PIL import Image
import numpy as np
from scipy.signal import find_peaks
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokemon-data.json','r',encoding='utf-8') as f:
    pd = json.load(f)

# ONLY ピジョット(012) unregistered. 登録数299.
unregistered = {12}
reg_seen = set()
registered = []
for p in sorted(pd['pokemon'], key=lambda x: (x['dexNumber'], x.get('slug',''))):
    if p['dexNumber'] not in reg_seen and p['dexNumber'] not in unregistered:
        reg_seen.add(p['dexNumber'])
        registered.append(p)
registered.sort(key=lambda x: x['dexNumber'])
dex_name = {p['dexNumber']: p['name'] for p in registered}
reg_dex = [p['dexNumber'] for p in registered]
print(f'Registered: {len(registered)}')

# Verify 176-183
print('176-183:')
for p in registered:
    if 176 <= p['dexNumber'] <= 183:
        print(f'  dex{p["dexNumber"]} {p["name"]}')

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

already = set()
total = 0
for si in range(len(ss_files)):
    img = Image.open(ss_files[si])
    sel = selected_dexes[si]
    sel_pos = reg_dex.index(sel)
    grid_dexes = reg_dex[sel_pos+1:]

    centers = []
    yc = None
    for ri, y in enumerate(ROW_YS):
        c = find_pokemon_centers(img, y)
        if ri == 0 and c:
            yc = c[0]
            centers.extend([(x,y) for x in c[1:]])
        else:
            centers.extend([(x,y) for x in c])

    if sel not in already and sel > 33 and yc:
        crop = img.crop((yc-CROP_HALF, ROW_YS[0]-CROP_HALF, yc+CROP_HALF, ROW_YS[0]+CROP_HALF))
        crop.save(os.path.join(img_dir, f'{sel:03d}.png'))
        already.add(sel)
        total += 1

    for idx in range(min(len(grid_dexes), len(centers))):
        d = grid_dexes[idx]
        if d in already or d <= 33:
            already.add(d)
            continue
        cx, cy = centers[idx]
        crop = img.crop((cx-CROP_HALF, cy-CROP_HALF, cx+CROP_HALF, cy+CROP_HALF))
        crop.save(os.path.join(img_dir, f'{d:03d}.png'))
        already.add(d)
        total += 1

print(f'\nExtracted: {total}')
checks = [70,71,72,73,141,152,176,177,178,179,180,181,182,183,280]
for d in checks:
    e = os.path.exists(os.path.join(img_dir, f'{d:03d}.png'))
    n = dex_name.get(d, '?')
    print(f'  {d:03d} {n}: {"OK" if e else "MISS"}')
imgs = [f for f in os.listdir(img_dir) if f.endswith('.png') and f[:-4].isdigit()]
print(f'Total images: {len(imgs)}')
