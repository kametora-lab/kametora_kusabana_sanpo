import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Gravity/amamikusabana_2_new/src/data/plants.json', 'r', encoding='utf-8') as f:
    plants = json.load(f)

used_ids = {'0034', '0051', '0078', '0080', '0089', '0094', '0118', '0143', '0166', '0183', '0186', '0193', '0204', '0229', '0239', '0260', '0277', '0287', '0315', '0434', '0435', '0426', '0282', '0015'}

for p in plants:
    pid = p.get('id')
    if pid in used_ids:
        continue
    months = p.get('months', [])
    images = p.get('images', [])
    # Check if '10月' in months or '9月,10月' etc
    if any('10' in str(m) for m in months) and len(images) >= 2:
        print(f"ID:{pid} | {p.get('title')} | 月:{months} | 色:{p.get('colors')} | 写真:{len(images)}枚")
