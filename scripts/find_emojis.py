"""Find emoji / decorative symbol characters in marketing site files."""
import os
import re
import sys

emoji_pattern = re.compile(
    '[\U0001F000-\U0001FFFF]'  # Supplementary Multilingual Plane
    '|[\u2600-\u27BF]'         # Misc symbols
    '|[\u2700-\u27BF]'         # Dingbats
    '|[\u2300-\u23FF]'         # Misc technical
    '|[\u2B00-\u2BFF]'         # Misc symbols and arrows
    '|[\u2190-\u21FF]'         # Arrows
    '|[\u2400-\u243F]'         # Control pictures
    '|[\u2460-\u24FF]'         # Enclosed alphanumerics
    '|[\u2500-\u257F]'         # Box drawing
    '|[\u2580-\u259F]'         # Block elements
    '|[\u25A0-\u25FF]'         # Geometric shapes
    '|[\u2600-\u26FF]'         # Misc symbols
    '|[\u2700-\u27BF]'         # Dingbats
    '|[\u27C0-\u27EF]'         # Misc math A
    '|[\u27F0-\u27FF]'         # Supplemental arrows A
    '|[\u2800-\u28FF]'         # Braille patterns
    '|[\u2900-\u297F]'         # Supplemental arrows B
    '|[\u2980-\u29FF]'         # Misc math B
    '|[\u2A00-\u2AFF]'         # Supplemental math operators
    '|[\u2B00-\u2BFF]'         # Misc symbols and arrows
    '|[\u2E00-\u2E7F]'         # Supplemental punctuation
    '|[\u3000-\u303F]'         # CJK symbols
    '|[\u3200-\u32FF]'         # Enclosed CJK
    '|[\u3300-\u33FF]'         # CJK compatibility
    '|[\uFE00-\uFE0F]'         # Variation selectors
    '|[\uFE20-\uFE2F]'         # Combining half marks
)

dirs = ['src/lib/marketing', 'src/components/marketing', 'src/components/layout']

found_any = False
for d in dirs:
    for root, dirnames, filenames in os.walk(d):
        for fn in filenames:
            if fn.endswith(('.ts', '.tsx')):
                path = os.path.join(root, fn)
                with open(path, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f, 1):
                        matches = emoji_pattern.findall(line)
                        if matches:
                            found_any = True
                            print(f'{path}:{i}: {" ".join(matches)}')
                            print(f'  > {line.rstrip()}')

if not found_any:
    print("No emoji/symbol characters found in marketing files.")
