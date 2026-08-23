# -*- coding: utf-8 -*-
import re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokedex.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find the container that holds all pokemon cards
# Cards are <a href="pokemon-XXX.html" class="pokemon-card" ...>...</a>
# They are inside a div with id="pokemon-grid" or similar

# Extract all card blocks
card_pattern = r'(<a href="pokemon-[^"]*\.html" class="pokemon-card"[\s\S]*?</a>)'
cards = re.findall(card_pattern, html)
print(f'Found {len(cards)} cards')

# Parse dex number from each card
card_data = []
for card_html in cards:
    dex_match = re.search(r'data-dex="(\d+)"', card_html)
    if dex_match:
        dex = int(dex_match.group(1))
        card_data.append((dex, card_html))
    else:
        card_data.append((9999, card_html))

# Sort by dex number
card_data.sort(key=lambda x: x[0])

# Check for duplicates
seen_dex = set()
for dex, _ in card_data:
    if dex in seen_dex:
        print(f'  WARNING: Duplicate dex {dex}')
    seen_dex.add(dex)

# Find the section containing the cards in the HTML
# Look for the first card and the last card to determine the range
first_card_pos = html.find(cards[0])
last_card_end = html.rfind('</a>', html.rfind('pokemon-card')) + 4

# Actually, let's find the container more precisely
# Find the first <a with pokemon-card and the last </a> after a pokemon-card
first_pos = None
last_pos = None
for m in re.finditer(r'<a href="pokemon-[^"]*\.html" class="pokemon-card"', html):
    if first_pos is None:
        first_pos = m.start()
    last_start = m.start()

# Find the </a> after the last card
last_pos = html.find('</a>', last_start) + 4

print(f'Card section: pos {first_pos} to {last_pos}')

# Build the new cards section
# Keep indentation consistent
new_cards_section = '\n'.join(card_html for _, card_html in card_data)

# Replace
new_html = html[:first_pos] + new_cards_section + '\n' + html[last_pos:]

# Verify order
dex_in_new = re.findall(r'data-dex="(\d+)"', new_html)
# Check if sorted
is_sorted = all(int(dex_in_new[i]) <= int(dex_in_new[i+1]) for i in range(len(dex_in_new)-1))
print(f'Cards sorted: {is_sorted}')
if not is_sorted:
    # Find first unsorted pair
    for i in range(len(dex_in_new)-1):
        if int(dex_in_new[i]) > int(dex_in_new[i+1]):
            print(f'  Unsorted at: dex{dex_in_new[i]} > dex{dex_in_new[i+1]}')
            break

with open('C:/Users/yamau/Downloads/MyCluade/pocoapokemon/pokedex.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f'Saved. Total cards: {len(card_data)}')
