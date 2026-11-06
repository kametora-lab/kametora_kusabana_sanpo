import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Gravity/amamikusabana_2_new/src/data/plants.json', 'r', encoding='utf-8') as f:
    plants = json.load(f)

used_ids = {'0034', '0051', '0078', '0080', '0089', '0094', '0118', '0143', '0166', '0183', '0186', '0193', '0204', '0229', '0239', '0260', '0277', '0287', '0315', '0434', '0435'}

good_plants = []
for p in plants:
    pid = p.get('id')
    if pid in used_ids:
        continue
    months = p.get('months', [])
    images = p.get('images', [])
    desc = p.get('description', '')
    # Check if has good description (more than 100 chars) and at least 2 images
    if len(desc) > 80 and len(images) >= 2:
        good_plants.append(p)

print(f"Total plants with detailed description and >=2 images: {len(good_plants)}")
for p in good_plants:
    m_str = ','.join(p.get('months', []))
    c_str = ','.join(p.get('colors', []))
    print(f"ID:{p.get('id')} | {p.get('title')} | 月:{m_str} | 色:{c_str} | 写真:{len(p.get('images'))}枚")
