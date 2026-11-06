import re

with open(r'C:\Gravity\VIDEO_IROIRO\remotion_video\src\Root.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'<Composition\s+id="AmamiPlantsReel"[\s\S]*?/>', text)
if match:
    print(match.group(0))
else:
    print('Not found')
