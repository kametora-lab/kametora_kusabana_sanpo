import pandas as pd
from pathlib import Path

# ===== 設定 =====
excel_path = "images.xlsx"
sheet_name = "Sheet1"
id_column = "id"
image_dir = Path("images")

# ===== Excel読み込み =====
df = pd.read_excel(excel_path, sheet_name=sheet_name)

# 旧ID → 新ID の対応表を作る
id_map = {}
new_ids = []

for i, old_id in enumerate(df[id_column], start=1):
    new_id = f"{i:04d}"
    id_map[str(old_id)] = new_id
    new_ids.append(new_id)

# Excelのid列を置き換え
df[id_column] = new_ids

# ===== 画像ファイル名変更 =====
for img_path in image_dir.glob("*.*"):
    name = img_path.stem      # adan_00
    suffix = img_path.suffix # .jpg

    if "_" not in name:
        continue

    old_id, rest = name.split("_", 1)

    if old_id in id_map:
        new_name = f"{id_map[old_id]}_{rest}{suffix}"
        img_path.rename(img_path.with_name(new_name))

# ===== Excel書き出し =====
df.to_excel("data_new.xlsx", index=False)
