# -*- coding: utf-8 -*-
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokedex.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix 1: dex070 キバゴ -> dex071, and rename the シャンデラ entry at 070b to 070
# Currently: two cards with data-dex="070", one for キバゴ and one for シャンデラ(variant slug 070b)
# キバゴ card: data-dex="070" -> change to data-dex="071", href pokemon-070 -> 071, No.070 -> No.071
# Also fix img src

# Fix キバゴ 070->071
html = html.replace(
    'href="pokemon-070.html" class="pokemon-card" data-name="キバゴ"',
    'href="pokemon-071.html" class="pokemon-card" data-name="キバゴ"'
)
html = html.replace(
    'data-name="キバゴ" data-types="ドラゴン" data-areas="pasapasa" data-dex="070"',
    'data-name="キバゴ" data-types="ドラゴン" data-areas="pasapasa" data-dex="071"'
)
# Fix the No. display and image
html = html.replace(
    'src="img/pokemon/070.png" alt="キバゴ"',
    'src="img/pokemon/071.png" alt="キバゴ"'
)

# Fix オノンド 071->072
html = html.replace(
    'href="pokemon-071.html" class="pokemon-card" data-name="オノンド"',
    'href="pokemon-072.html" class="pokemon-card" data-name="オノンド"'
)
html = html.replace(
    'data-name="オノンド" data-types="ドラゴン" data-areas="pasapasa" data-dex="071"',
    'data-name="オノンド" data-types="ドラゴン" data-areas="pasapasa" data-dex="072"'
)
html = html.replace(
    'src="img/pokemon/071.png" alt="オノンド"',
    'src="img/pokemon/072.png" alt="オノンド"'
)

# Fix オノノクス 072->073
html = html.replace(
    'href="pokemon-072.html" class="pokemon-card" data-name="オノノクス"',
    'href="pokemon-073.html" class="pokemon-card" data-name="オノノクス"'
)
html = html.replace(
    'data-name="オノノクス" data-types="ドラゴン" data-areas="pasapasa" data-dex="072"',
    'data-name="オノノクス" data-types="ドラゴン" data-areas="pasapasa" data-dex="073"'
)
html = html.replace(
    'src="img/pokemon/072.png" alt="オノノクス"',
    'src="img/pokemon/073.png" alt="オノノクス"'
)

# Fix ミミッキュ 152->141
html = html.replace(
    'href="pokemon-152.html" class="pokemon-card" data-name="ミミッキュ"',
    'href="pokemon-141.html" class="pokemon-card" data-name="ミミッキュ"'
)
html = html.replace(
    'data-name="ミミッキュ" data-types="ゴースト,フェアリー" data-areas="kirakira" data-dex="152"',
    'data-name="ミミッキュ" data-types="ゴースト,フェアリー" data-areas="kirakira" data-dex="141"'
)
html = html.replace(
    'src="img/pokemon/152.png" alt="ミミッキュ"',
    'src="img/pokemon/141.png" alt="ミミッキュ"'
)

# Fix コータス 176->182
html = html.replace(
    'href="pokemon-176.html" class="pokemon-card" data-name="コータス"',
    'href="pokemon-182.html" class="pokemon-card" data-name="コータス"'
)
# Need to find exact data attributes for コータス
html = re.sub(
    r'data-name="コータス"([^>]*?)data-dex="176"',
    r'data-name="コータス"\1data-dex="182"',
    html
)
html = html.replace(
    'src="img/pokemon/176.png" alt="コータス"',
    'src="img/pokemon/182.png" alt="コータス"'
)

# Fix コロボーシ 177->176
html = html.replace(
    'href="pokemon-177.html" class="pokemon-card" data-name="コロボーシ"',
    'href="pokemon-176.html" class="pokemon-card" data-name="コロボーシ"'
)
html = re.sub(
    r'data-name="コロボーシ"([^>]*?)data-dex="177"',
    r'data-name="コロボーシ"\1data-dex="176"',
    html
)
html = html.replace(
    'src="img/pokemon/177.png" alt="コロボーシ"',
    'src="img/pokemon/176.png" alt="コロボーシ"'
)

# Fix コロトック 178->177
html = html.replace(
    'href="pokemon-178.html" class="pokemon-card" data-name="コロトック"',
    'href="pokemon-177.html" class="pokemon-card" data-name="コロトック"'
)
html = re.sub(
    r'data-name="コロトック"([^>]*?)data-dex="178"',
    r'data-name="コロトック"\1data-dex="177"',
    html
)
html = html.replace(
    'src="img/pokemon/178.png" alt="コロトック"',
    'src="img/pokemon/177.png" alt="コロトック"'
)

# Fix ペラップ 179->178
html = html.replace(
    'href="pokemon-179.html" class="pokemon-card" data-name="ペラップ"',
    'href="pokemon-178.html" class="pokemon-card" data-name="ペラップ"'
)
html = re.sub(
    r'data-name="ペラップ"([^>]*?)data-dex="179"',
    r'data-name="ペラップ"\1data-dex="178"',
    html
)
html = html.replace(
    'src="img/pokemon/179.png" alt="ペラップ"',
    'src="img/pokemon/178.png" alt="ペラップ"'
)

# Fix リオル 180->179
html = html.replace(
    'href="pokemon-180.html" class="pokemon-card" data-name="リオル"',
    'href="pokemon-179.html" class="pokemon-card" data-name="リオル"'
)
html = re.sub(
    r'data-name="リオル"([^>]*?)data-dex="180"',
    r'data-name="リオル"\1data-dex="179"',
    html
)
html = html.replace(
    'src="img/pokemon/180.png" alt="リオル"',
    'src="img/pokemon/179.png" alt="リオル"'
)

# Fix ルカリオ 181->180
html = html.replace(
    'href="pokemon-181.html" class="pokemon-card" data-name="ルカリオ"',
    'href="pokemon-180.html" class="pokemon-card" data-name="ルカリオ"'
)
html = re.sub(
    r'data-name="ルカリオ"([^>]*?)data-dex="181"',
    r'data-name="ルカリオ"\1data-dex="180"',
    html
)
html = html.replace(
    'src="img/pokemon/181.png" alt="ルカリオ"',
    'src="img/pokemon/180.png" alt="ルカリオ"'
)

# Now fix the No.XXX display text
# Update all the <span class="pokemon-dex">No.XXX</span> for changed entries
fixes_no = [
    ('キバゴ', '070', '071'),
    ('オノンド', '071', '072'),
    ('オノノクス', '072', '073'),
    ('ミミッキュ', '152', '141'),
    ('コータス', '176', '182'),
    ('コロボーシ', '177', '176'),
    ('コロトック', '178', '177'),
    ('ペラップ', '179', '178'),
    ('リオル', '180', '179'),
    ('ルカリオ', '181', '180'),
]

# We need a smarter approach to fix No.XXX - find the card and update
for name, old_no, new_no in fixes_no:
    # Find the card section for this pokemon and update the No. display
    # Pattern: within a card for this name, find No.OLD and replace with No.NEW
    old_text = f'No.{old_no}'
    new_text = f'No.{new_no}'
    # Only replace within the context of this pokemon's card
    # Since we already fixed data-dex, we can search near data-dex=new_no
    # Simple approach: replace the specific No.XXX that appears right before/after the name
    pattern = f'(data-dex="{new_no}"[\\s\\S]*?)<span class="pokemon-dex">{old_text}</span>'
    replacement = f'\\1<span class="pokemon-dex">{new_text}</span>'
    html = re.sub(pattern, replacement, html)

# Add missing cards: ステレオロトム (dex181), and possibly others
# Insert ステレオロトム card after ルカリオ (dex180)
stereo_card = '''    <a href="pokemon-181.html" class="pokemon-card" data-name="ステレオロトム" data-types="でんき,ノーマル" data-areas="" data-dex="181">
      <div style="display:flex; align-items:center; gap:8px;">

        <div>
          <span class="pokemon-dex">No.181</span>
          <span class="pokemon-name">ステレオロトム</span>
          <span class="pokemon-type">でんき / ノーマル</span>
        </div>
      </div>
    </a>'''

# Find ルカリオ card end and insert after it
lukario_end = html.find('</a>', html.find('data-dex="180"'))
if lukario_end > 0:
    insert_pos = lukario_end + 4  # after </a>
    html = html[:insert_pos] + '\n' + stereo_card + html[insert_pos:]
    print('Added ステレオロトム card after ルカリオ')

# Also need to add ミミッキュ card if it's been moved
# Check if dex073 card exists
if 'data-dex="073"' in html:
    print('dex073 card exists')
else:
    print('dex073 card MISSING - need to add オノノクス')

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokedex.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('pokedex.html updated')

# Final verification
dex_in_html = re.findall(r'data-dex="(\d+)"', html)
print(f'Total cards: {len(dex_in_html)}')
for check in ['070', '071', '072', '073', '141', '152', '176', '177', '178', '179', '180', '181', '182']:
    count = dex_in_html.count(check)
    print(f'  dex{check}: {count}x')
