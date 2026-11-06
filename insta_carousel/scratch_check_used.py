import json
import glob
import os
import sys

# Set stdout encoding
sys.stdout.reconfigure(encoding='utf-8')

configs = sorted(glob.glob('c:/Gravity/amamikusabana_2_new/insta_carousel/configs/*.json'))
used_plants = []
used_ids = set()

for c in configs:
    try:
        with open(c, 'r', encoding='utf-8') as f:
            data = json.load(f)
            plants = data.get('plants', [])
            names = []
            for p in plants:
                img = p.get('main_img', '')
                pid = img.split('_')[0] if '_' in img else ''
                used_ids.add(pid)
                names.append(f"{p.get('name')} (ID:{pid})")
            print(f"{os.path.basename(c)}: {', '.join(names)}")
    except Exception as e:
        print(f"Error reading {c}: {e}")

print("\n--- ALL USED IDS ---")
print(sorted(list(used_ids)))
