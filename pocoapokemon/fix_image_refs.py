#!/usr/bin/env python3
"""
Verify and fix pokemon image references in all HTML files
using pokemon-data.json as the single source of truth.
"""

import json
import os
import re
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, "pokemon-data.json")

# Load pokemon data
with open(JSON_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Build slug -> image mapping
slug_to_image = {}
slug_to_name = {}
for entry in data["pokemon"]:
    slug = entry["slug"]
    image = entry["image"]
    name = entry["name"]
    slug_to_image[slug] = image
    slug_to_name[slug] = name

print(f"Loaded {len(slug_to_image)} pokemon entries from JSON")
print(f"Sample entries:")
for s in ["001", "041-hakase", "059-nishi", "068b"]:
    if s in slug_to_image:
        print(f"  slug={s} -> image={slug_to_image[s]} ({slug_to_name[s]})")

# Pattern to match img/pokemon/*.png references
img_pattern = re.compile(r'(img/pokemon/)(\d{3}(?:b)?\.png)')

# Also match references that might have variant suffixes incorrectly
img_pattern_any = re.compile(r'(img/pokemon/)([^"\'>\s]+\.png)')

# Track all fixes
fixes = []
files_checked = 0
refs_checked = 0

# Get all HTML files
html_files = glob.glob(os.path.join(BASE_DIR, "*.html"))
html_files.sort()

for html_path in html_files:
    filename = os.path.basename(html_path)

    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    original_content = content

    # Find all img/pokemon/ references
    for match in img_pattern_any.finditer(content):
        prefix = match.group(1)  # "img/pokemon/"
        img_file = match.group(2)  # e.g. "001.png"
        refs_checked += 1

        # Determine what slug this reference belongs to
        # For pokemon-*.html pages, we can infer from filename
        # For area-*.html and pokedex.html, we need to check context

        # The image filename should match based on the link context
        # Let's check if img_file is in the set of valid images
        valid_images = set(slug_to_image.values())
        if img_file not in valid_images:
            print(f"  WARNING: {filename} references unknown image: img/pokemon/{img_file}")

    # For pokemon-*.html files, verify the main pokemon image
    pokemon_match = re.match(r'pokemon-(.+)\.html$', filename)
    if pokemon_match:
        slug = pokemon_match.group(1)
        if slug in slug_to_image:
            expected_image = slug_to_image[slug]
            # Check if this file has an img/pokemon/ reference
            for match in img_pattern_any.finditer(content):
                img_file = match.group(2)
                if img_file != expected_image:
                    old_ref = f"img/pokemon/{img_file}"
                    new_ref = f"img/pokemon/{expected_image}"
                    content = content.replace(old_ref, new_ref)
                    fixes.append((filename, old_ref, new_ref, slug_to_name.get(slug, "?")))

    # For area-*.html and pokedex.html, check each img reference against the
    # linked pokemon page to determine expected image
    if filename.startswith("area-") or filename == "pokedex.html":
        # Find patterns like: href="pokemon-XXX.html"...img src="img/pokemon/YYY.png"
        # These are typically in table rows or card elements
        link_img_pattern = re.compile(
            r'href="pokemon-([^"]+)\.html"[^>]*>.*?'
            r'img\s+src="img/pokemon/([^"]+\.png)"',
            re.DOTALL
        )

        for m in link_img_pattern.finditer(content):
            linked_slug = m.group(1)
            current_img = m.group(2)

            if linked_slug in slug_to_image:
                expected = slug_to_image[linked_slug]
                if current_img != expected:
                    # Need to be careful with replacements in context
                    old_fragment = m.group(0)
                    new_fragment = old_fragment.replace(
                        f'img/pokemon/{current_img}',
                        f'img/pokemon/{expected}'
                    )
                    content = content.replace(old_fragment, new_fragment)
                    fixes.append((filename, f"img/pokemon/{current_img}", f"img/pokemon/{expected}",
                                  f"linked to pokemon-{linked_slug}.html ({slug_to_name.get(linked_slug, '?')})"))

    files_checked += 1

    if content != original_content:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  FIXED: {filename}")

print(f"\n{'='*60}")
print(f"Summary:")
print(f"  Files checked: {files_checked}")
print(f"  Image references checked: {refs_checked}")
print(f"  Fixes applied: {len(fixes)}")

if fixes:
    print(f"\nDetailed fixes:")
    for filename, old_ref, new_ref, context in fixes:
        print(f"  {filename}: {old_ref} -> {new_ref} ({context})")
else:
    print("\n  All image references are correct! No fixes needed.")
