# -*- coding: utf-8 -*-
import re, os, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokedex.html', 'r', encoding='utf-8') as f:
    html = f.read()

img_dir = 'C:/Users/yamau/Downloads/MyCluade/pocoapokemon/img/pokemon'
existing_imgs = set()
for fn in os.listdir(img_dir):
    if fn.endswith('.png') and fn[:-4].isdigit():
        existing_imgs.add(fn[:-4])

# Find cards without img tag and add img if image file exists
# Card with img has: <div style="flex-shrink:0;"><img ...></div>
# Card without img has just whitespace between the two divs

lines = html.split('\n')
new_lines = []
i = 0
added = 0

while i < len(lines):
    line = lines[i]
    # Check if this is a pokemon-card line
    card_match = re.search(r'data-dex="(\d+)"', line)
    if card_match and 'pokemon-card' in line:
        dex = card_match.group(1)
        name_match = re.search(r'data-name="([^"]+)"', line)
        name = name_match.group(1) if name_match else ''

        # Look ahead: is there an img tag within the next 3 lines?
        has_img = False
        for j in range(i+1, min(i+5, len(lines))):
            if '<img src="img/pokemon/' in lines[j]:
                has_img = True
                break

        if not has_img and dex in existing_imgs:
            # Find the empty line and insert img tag
            new_lines.append(line)
            i += 1
            # Next line should be the flex div
            if i < len(lines) and 'display:flex' in lines[i]:
                new_lines.append(lines[i])
                i += 1
                # Next line is empty/whitespace - replace with img
                if i < len(lines) and lines[i].strip() == '':
                    img_tag = f'        <div style="flex-shrink:0;"><img src="img/pokemon/{dex}.png" alt="{name}" width="48" height="48" loading="lazy" style="image-rendering:pixelated;"></div>'
                    new_lines.append(img_tag)
                    added += 1
                    i += 1
                    continue
            continue

    new_lines.append(line)
    i += 1

new_html = '\n'.join(new_lines)

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokedex.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

total_imgs = new_html.count('<img src="img/pokemon/')
print(f'Added {added} img tags. Total now: {total_imgs}')
