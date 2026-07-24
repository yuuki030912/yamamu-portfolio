# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokemon-data.json','r',encoding='utf-8') as f:
    pd = json.load(f)

pokemon = pd['pokemon']

# Revert fix 1: キバゴ 071->070, オノンド 072->071, オノノクス 073->072
# Revert fix 2: ミミッキュ 141->152
# Revert fix 3: コロボーシ 176->177, コロトック 177->178, ペラップ 178->179, リオル 179->180, ルカリオ 180->181, コータス 182->176
# Remove added: ステレオロトム (dex181)

to_remove = []
for i, p in enumerate(pokemon):
    name = p['name']
    slug = p.get('slug', '')
    
    # Revert area 1
    if name == 'キバゴ' and p['dexNumber'] == 71 and slug == '071':
        p['dexNumber'] = 70
        p['slug'] = '070'
        print(f'Reverted: キバゴ 071->070')
    elif name == 'オノンド' and p['dexNumber'] == 72 and slug == '072':
        p['dexNumber'] = 71
        p['slug'] = '071'
        print(f'Reverted: オノンド 072->071')
    elif name == 'オノノクス' and p['dexNumber'] == 73 and slug == '073':
        p['dexNumber'] = 72
        p['slug'] = '072'
        print(f'Reverted: オノノクス 073->072')
    
    # Revert area 2
    elif name == 'ミミッキュ' and p['dexNumber'] == 141 and slug == '141':
        p['dexNumber'] = 152
        p['slug'] = '152'
        print(f'Reverted: ミミッキュ 141->152')
    
    # Revert area 3
    elif name == 'コータス' and p['dexNumber'] == 182 and slug == '182':
        p['dexNumber'] = 176
        p['slug'] = '176'
        print(f'Reverted: コータス 182->176')
    elif name == 'コロボーシ' and p['dexNumber'] == 176 and slug == '176':
        p['dexNumber'] = 177
        p['slug'] = '177'
        print(f'Reverted: コロボーシ 176->177')
    elif name == 'コロトック' and p['dexNumber'] == 177 and slug == '177':
        p['dexNumber'] = 178
        p['slug'] = '178'
        print(f'Reverted: コロトック 177->178')
    elif name == 'ペラップ' and p['dexNumber'] == 178 and slug == '178':
        p['dexNumber'] = 179
        p['slug'] = '179'
        print(f'Reverted: ペラップ 178->179')
    elif name == 'リオル' and p['dexNumber'] == 179 and slug == '179':
        p['dexNumber'] = 180
        p['slug'] = '180'
        print(f'Reverted: リオル 179->180')
    elif name == 'ルカリオ' and p['dexNumber'] == 180 and slug == '180':
        p['dexNumber'] = 181
        p['slug'] = '181'
        print(f'Reverted: ルカリオ 180->181')
    
    # Remove ステレオロトム (was added, not in original)
    elif name == 'ステレオロトム':
        to_remove.append(i)
        print(f'Removing: ステレオロトム (dex{p["dexNumber"]})')

# Remove in reverse order
for i in reversed(to_remove):
    pokemon.pop(i)

# Save
with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokemon-data.json','w',encoding='utf-8') as f:
    json.dump(pd, f, ensure_ascii=False, indent=2)

# Verify
seen = set()
unique = []
for p in pokemon:
    if p['dexNumber'] not in seen:
        seen.add(p['dexNumber'])
        unique.append(p)
unique.sort(key=lambda x: x['dexNumber'])

print(f'\nTotal unique: {len(unique)}')
print('068-077:')
for p in unique:
    if 68 <= p['dexNumber'] <= 77:
        print(f'  dex{p["dexNumber"]}: {p["name"]}')
print('175-184:')
for p in unique:
    if 175 <= p['dexNumber'] <= 184:
        print(f'  dex{p["dexNumber"]}: {p["name"]}')
print('150-155:')
for p in unique:
    if 150 <= p['dexNumber'] <= 155:
        print(f'  dex{p["dexNumber"]}: {p["name"]}')
