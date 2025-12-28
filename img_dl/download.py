import os
import time
import pandas as pd
import requests
from urllib.parse import urlparse

EXCEL_FILE = "images.xlsx"
SAVE_DIR = "downloaded_images"
IMAGE_COLUMNS = range(6, 17)  # G..Q
ID_COLUMN_INDEX = 0           # A列
MAX_RETRY = 3

os.makedirs(SAVE_DIR, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def safe_id(value):
    s = str(value).strip()
    for ch in r'\/:*?"<>|':
        s = s.replace(ch, "_")
    return s

df = pd.read_excel(EXCEL_FILE)

for _, row in df.iterrows():
    raw_id = row.iloc[ID_COLUMN_INDEX]
    if pd.isna(raw_id):
        continue

    plant_id = safe_id(raw_id)
    count = 0

    for col in IMAGE_COLUMNS:
        url = row.iloc[col]
        if not (isinstance(url, str) and url.startswith("http")):
            continue

        path = urlparse(url).path
        ext = os.path.splitext(path)[1] or ".jpg"
        filename = f"{plant_id}_{count:02d}{ext}"
        save_path = os.path.join(SAVE_DIR, filename)

        if os.path.exists(save_path):
            count += 1
            continue

        for attempt in range(1, MAX_RETRY + 1):
            try:
                r = requests.get(url, headers=headers, timeout=20)
                r.raise_for_status()
                with open(save_path, "wb") as f:
                    f.write(r.content)
                print(f"saved: {filename} <- {url}")
                count += 1
                time.sleep(1.5)
                break
            except Exception as e:
                print(f"retry {attempt}/{MAX_RETRY}: {url} -> {e}")
                time.sleep(3)
        else:
            print(f"give up: {url}")
