# -*- coding: utf-8 -*-
import os
import sys
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = r"C:\Gravity\amamikusabana_2_new"
IMG_DIR = os.path.join(BASE_DIR, "public", "images")
OUT_DIR = os.path.join(BASE_DIR, "insta_carousel", "output", "intro")
os.makedirs(OUT_DIR, exist_ok=True)

# Fonts (Windows standard)
FONT_UD_B = r"C:\Windows\Fonts\UDDigiKyokashoN-B.ttc"
FONT_UD_R = r"C:\Windows\Fonts\UDDigiKyokashoN-R.ttc"
FONT_BIZ_B = r"C:\Windows\Fonts\BIZ-UDGothicB.ttc"
FONT_MIN_B = r"C:\Windows\Fonts\yumindb.ttf"

def get_font(path, size):
    return ImageFont.truetype(path, size)

def crop_to_aspect(img, target_w, target_h, focus_x=0.5, focus_y=0.5):
    src_w, src_h = img.size
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h
    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = int((src_w - new_w) * focus_x)
        left = max(0, min(src_w - new_w, left))
        img = img.crop((left, 0, left + new_w, src_h))
    elif src_ratio < target_ratio:
        new_h = int(src_w / target_ratio)
        top = int((src_h - new_h) * focus_y)
        top = max(0, min(src_h - new_h, top))
        img = img.crop((0, top, src_w, top + new_h))
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)

def create_rounded_image(img, radius):
    """画像の四隅を美しく角丸にする"""
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), img.size], radius=radius, fill=255)
    result = img.convert("RGBA")
    result.putalpha(mask)
    return result

def draw_soft_shadow(base_img, xy, radius=20, blur=15, offset=(0, 6), color=(0, 0, 0, 35)):
    """角丸矩形のソフトシャドウを描画"""
    x1, y1, x2, y2 = xy
    w = (x2 - x1) + blur * 4
    h = (y2 - y1) + blur * 4
    shadow_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_layer)
    rect_box = [blur * 2, blur * 2, blur * 2 + (x2 - x1), blur * 2 + (y2 - y1)]
    s_draw.rounded_rectangle(rect_box, radius=radius, fill=color)
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(blur))
    paste_x = x1 - blur * 2 + offset[0]
    paste_y = y1 - blur * 2 + offset[1]
    base_img.alpha_composite(shadow_layer, (paste_x, paste_y))

def draw_search_icon(draw, cx, cy, radius=13, width=3, color=(60, 80, 70, 255)):
    """解像度に依存しない美しい虫眼鏡ベクターアイコンを描画"""
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=color, width=width)
    dx = int(radius * 0.707)
    dy = int(radius * 0.707)
    draw.line([(cx + dx, cy + dy), (cx + dx + 11, cy + dy + 11)], fill=color, width=width + 1)

def generate_style_a():
    """スタイルA：やさしいインフォグラフィック・図鑑ポスター風"""
    W, H = 1080, 1350
    canvas = Image.new("RGBA", (W, H), (248, 246, 240, 255))
    
    top_bar = Image.new("RGBA", (W, 10), (45, 95, 68, 255))
    canvas.paste(top_bar, (0, 0))

    draw = ImageDraw.Draw(canvas)
    
    # ピルバッジ
    badge_text = "世界自然遺産の島・奄美大島 ｜ WEB植物写真帖"
    font_badge = get_font(FONT_UD_B, 21)
    badge_bbox = font_badge.getbbox(badge_text)
    bw = badge_bbox[2] - badge_bbox[0] + 36
    bh = 38
    bx = (W - bw) // 2
    by = 52
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=19, fill=(230, 239, 233, 255))
    draw.text((bx + 18, by + 7), badge_text, font=font_badge, fill=(40, 84, 62, 255))

    # メインタイトル
    font_title = get_font(FONT_UD_B, 60)
    title_text = "奄美の草花さんぽ帖"
    t_bbox = font_title.getbbox(title_text)
    tw = t_bbox[2] - t_bbox[0]
    draw.text(((W - tw) // 2, 108), title_text, font=font_title, fill=(26, 56, 40, 255))

    # サブコピー
    font_sub = get_font(FONT_UD_R, 25)
    sub_text = "道端で出会った「この花なあに？」がすぐ見つかる"
    s_bbox = font_sub.getbbox(sub_text)
    sw = s_bbox[2] - s_bbox[0]
    draw.text(((W - sw) // 2, 184), sub_text, font=font_sub, fill=(90, 105, 96, 255))

    # --- 草花ミニカード（4枚グリッド） ---
    plants = [
        {
            "img": "0078_03.jpg",
            "name": "ハリツルマサキ",
            "tag": "秋〜冬の赤い実",
            "desc": "小さなハートの実がなる\n愛らしい島の低木。",
            "focus": (0.55, 0.55)
        },
        {
            "img": "0259_00.jpg",
            "name": "サガリバナ",
            "tag": "夏の夜咲く花",
            "desc": "夜に咲き、朝にはぽとりと散る\n甘く香る幻の花。",
            "focus": (0.5, 0.4)
        },
        {
            "img": "0319_01.jpg",
            "name": "テッポウユリ",
            "tag": "春〜初夏の花",
            "desc": "海岸や崖の岩場を純白に染める\n奄美に自生する百合。",
            "focus": (0.5, 0.4)
        },
        {
            "img": "0044_00.jpg",
            "name": "ゲットウ（月桃）",
            "tag": "初夏の花・実",
            "desc": "みずみずしい桃色の蕾と\nお餅を包む香りの良い葉。",
            "focus": (0.5, 0.4)
        }
    ]

    card_w = 465
    card_h = 166
    grid_start_y = 232
    col_x = [60, 555]
    row_y = [grid_start_y, grid_start_y + card_h + 16]

    font_pname = get_font(FONT_UD_B, 24)
    font_ptag = get_font(FONT_UD_B, 16)
    font_pdesc = get_font(FONT_UD_R, 18)

    for i, p in enumerate(plants):
        cx = col_x[i % 2]
        cy = row_y[i // 2]
        
        draw_soft_shadow(canvas, (cx, cy, cx + card_w, cy + card_h), radius=18, blur=10, offset=(0, 4), color=(0, 0, 0, 20))
        
        card_draw = ImageDraw.Draw(canvas)
        card_draw.rounded_rectangle([cx, cy, cx + card_w, cy + card_h], radius=18, fill=(255, 255, 255, 255), outline=(232, 237, 234, 255), width=1)
        
        img_path = os.path.join(IMG_DIR, p["img"])
        if os.path.exists(img_path):
            src_img = Image.open(img_path).convert("RGB")
            crop_img = crop_to_aspect(src_img, 142, 142, p["focus"][0], p["focus"][1])
            rounded_img = create_rounded_image(crop_img, radius=12)
            canvas.alpha_composite(rounded_img, (cx + 12, cy + 12))
        
        tx = cx + 168
        tag_text = p["tag"]
        tag_bbox = font_ptag.getbbox(tag_text)
        tag_w = tag_bbox[2] - tag_bbox[0] + 16
        card_draw.rounded_rectangle([tx, cy + 14, tx + tag_w, cy + 14 + 24], radius=12, fill=(240, 245, 242, 255))
        card_draw.text((tx + 8, cy + 16), tag_text, font=font_ptag, fill=(52, 98, 72, 255))

        card_draw.text((tx, cy + 44), p["name"], font=font_pname, fill=(26, 46, 35, 255))

        lines = p["desc"].split("\n")
        line_y = cy + 82
        for l in lines:
            card_draw.text((tx, line_y), l, font=font_pdesc, fill=(85, 98, 90, 255))
            line_y += 26

    # --- セクション3：サイトの魅力 3つのやさしいポイント ---
    box_x = 60
    box_y = 600
    box_w = 960
    box_h = 515
    
    draw_soft_shadow(canvas, (box_x, box_y, box_x + box_w, box_y + box_h), radius=24, blur=15, offset=(0, 6), color=(0, 0, 0, 24))
    
    box_draw = ImageDraw.Draw(canvas)
    box_draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h], radius=24, fill=(255, 255, 255, 255), outline=(225, 233, 228, 255), width=1)

    header_box_h = 60
    box_draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + header_box_h], radius=24, fill=(240, 246, 242, 255))
    box_draw.rectangle([box_x, box_y + 30, box_x + box_w, box_y + header_box_h], fill=(240, 246, 242, 255))

    font_box_header = get_font(FONT_UD_B, 24)
    h_text = "◆ 初めての方へ ｜ 奄美の草花さんぽ帖の楽しみ方"
    box_draw.text((box_x + 30, box_y + 17), h_text, font=font_box_header, fill=(35, 78, 55, 255))

    points = [
        {
            "num": "01",
            "title": "400種類以上の草花を、美しい写真で収録",
            "desc": "難しい植物用語はゼロ。奄美大島在住20年の管理人が\n島内を歩き回り、自らの足と目で撮りためた生きた記録です。"
        },
        {
            "num": "02",
            "title": "花の色・咲く季節から直感的に探せる",
            "desc": "「赤い花」「白い花」「今咲いている花」など、見たい条件から\nパッと調べられるので、花の名前を知らなくても楽しめます。"
        },
        {
            "num": "03",
            "title": "スマホ片手にお散歩気分＆旅行のお供に",
            "desc": "奄美旅行中の道端散策はもちろん、おうちのスキマ時間にも。\n眺めているだけで南国の風を感じる、癒やしのデジタル図鑑です。"
        }
    ]

    py = box_y + 85
    font_num = get_font(FONT_BIZ_B, 20)
    font_pttl = get_font(FONT_UD_B, 24)
    font_pbody = get_font(FONT_UD_R, 19)

    for pt in points:
        nx = box_x + 36
        ny = py + 2
        box_draw.rounded_rectangle([nx, ny, nx + 44, ny + 44], radius=22, fill=(45, 95, 68, 255))
        n_bbox = font_num.getbbox(pt["num"])
        nw = n_bbox[2] - n_bbox[0]
        box_draw.text((nx + (44 - nw) // 2, ny + 10), pt["num"], font=font_num, fill=(255, 255, 255, 255))

        box_draw.text((box_x + 95, py + 8), pt["title"], font=font_pttl, fill=(26, 46, 35, 255))

        p_lines = pt["desc"].split("\n")
        body_y = py + 52
        for pl in p_lines:
            box_draw.text((box_x + 95, body_y), pl, font=font_pbody, fill=(90, 102, 95, 255))
            body_y += 28

        py += 136

    # --- セクション4：フッター案内 ---
    foot_draw = ImageDraw.Draw(canvas)
    
    font_lead = get_font(FONT_UD_B, 24)
    lead_text = "＼ プロフィールのリンクから今すぐ見られます ／"
    lead_bbox = font_lead.getbbox(lead_text)
    lw = lead_bbox[2] - lead_bbox[0]
    foot_draw.text(((W - lw) // 2, 1142), lead_text, font=font_lead, fill=(205, 92, 60, 255))

    bar_w = 640
    bar_h = 62
    bar_x = (W - bar_w) // 2
    bar_y = 1184
    
    draw_soft_shadow(canvas, (bar_x, bar_y, bar_x + bar_w, bar_y + bar_h), radius=31, blur=8, offset=(0, 3), color=(0, 0, 0, 18))
    foot_draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], radius=31, fill=(255, 255, 255, 255), outline=(200, 212, 204, 255), width=2)

    draw_search_icon(foot_draw, bar_x + 38, bar_y + 31, radius=13, width=3, color=(70, 90, 80, 255))

    font_search_q = get_font(FONT_UD_B, 24)
    foot_draw.text((bar_x + 68, bar_y + 17), "奄美の草花さんぽ帖", font=font_search_q, fill=(50, 65, 58, 255))

    btn_w = 120
    btn_h = 48
    btn_x = bar_x + bar_w - btn_w - 7
    btn_y = bar_y + 7
    foot_draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=24, fill=(45, 95, 68, 255))
    font_btn = get_font(FONT_UD_B, 20)
    foot_draw.text((btn_x + 28, btn_y + 12), "検 索", font=font_btn, fill=(255, 255, 255, 255))

    font_foot_note = get_font(FONT_UD_R, 19)
    note_text = "無料ですぐ見られるWeb植物写真図鑑 ｜ 随時更新中"
    n_bbox = font_foot_note.getbbox(note_text)
    nw = n_bbox[2] - n_bbox[0]
    foot_draw.text(((W - nw) // 2, 1268), note_text, font=font_foot_note, fill=(115, 130, 122, 255))

    out_path = os.path.join(OUT_DIR, "amami_intro_style_a.png")
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"Saved Style A to {out_path}")
    return out_path

def generate_style_b():
    """スタイルB：情緒的な大判写真×マガジン表紙風（やさしいタイポグラフィ）"""
    W, H = 1080, 1350
    canvas = Image.new("RGBA", (W, H), (250, 248, 244, 255))

    photo_box = Image.new("RGBA", (W, 720), (0, 0, 0, 255))
    
    img_main = Image.open(os.path.join(IMG_DIR, "0259_00.jpg")).convert("RGB")
    img_main = crop_to_aspect(img_main, 660, 720, 0.5, 0.4)
    photo_box.paste(img_main, (0, 0))

    img_tr = Image.open(os.path.join(IMG_DIR, "0078_03.jpg")).convert("RGB")
    img_tr = crop_to_aspect(img_tr, 410, 355, 0.55, 0.55)
    photo_box.paste(img_tr, (670, 0))

    img_br = Image.open(os.path.join(IMG_DIR, "0319_01.jpg")).convert("RGB")
    img_br = crop_to_aspect(img_br, 410, 355, 0.5, 0.4)
    photo_box.paste(img_br, (670, 365))

    line_draw = ImageDraw.Draw(photo_box)
    line_draw.line([(665, 0), (665, 720)], fill=(255, 255, 255, 255), width=10)
    line_draw.line([(665, 360), (W, 360)], fill=(255, 255, 255, 255), width=10)

    canvas.paste(photo_box, (0, 0))

    tag_overlay = Image.new("RGBA", (W, 90), (0, 0, 0, 0))
    t_draw = ImageDraw.Draw(tag_overlay)
    t_draw.rounded_rectangle([40, 35, 360, 77], radius=21, fill=(0, 0, 0, 145))
    font_top_tag = get_font(FONT_UD_B, 20)
    t_draw.text((60, 44), "奄美大島 ｜ WEB草花写真帖", font=font_top_tag, fill=(255, 255, 255, 245))
    canvas.alpha_composite(tag_overlay, (0, 0))

    card_x = 45
    card_y = 645
    card_w = 990
    card_h = 655
    
    draw_soft_shadow(canvas, (card_x, card_y, card_x + card_w, card_y + card_h), radius=28, blur=22, offset=(0, -6), color=(0, 0, 0, 30))
    
    card_draw = ImageDraw.Draw(canvas)
    card_draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=28, fill=(255, 255, 255, 255), outline=(230, 236, 232, 255), width=1)

    font_pill = get_font(FONT_UD_B, 18)
    pill_text = "AMAMI FLORA ARCHIVE"
    p_bbox = font_pill.getbbox(pill_text)
    pw = p_bbox[2] - p_bbox[0] + 32
    px = card_x + (card_w - pw) // 2
    py = card_y + 36
    card_draw.rounded_rectangle([px, py, px + pw, py + 34], radius=17, fill=(240, 246, 242, 255))
    card_draw.text((px + 16, py + 6), pill_text, font=font_pill, fill=(52, 98, 72, 255))

    font_main_title = get_font(FONT_UD_B, 58)
    mt_text = "奄美の草花さんぽ帖"
    mt_bbox = font_main_title.getbbox(mt_text)
    mt_w = mt_bbox[2] - mt_bbox[0]
    card_draw.text((card_x + (card_w - mt_w) // 2, card_y + 86), mt_text, font=font_main_title, fill=(26, 48, 36, 255))

    font_lead = get_font(FONT_UD_R, 24)
    lead_line1 = "お散歩気分で、奄美の草花の世界をのぞいてみませんか？"
    lead_line2 = "道端の何気ない野草から南国の幻の花まで、400種以上を写真で記録。"
    l1_bbox = font_lead.getbbox(lead_line1)
    l2_bbox = font_lead.getbbox(lead_line2)
    card_draw.text((card_x + (card_w - (l1_bbox[2] - l1_bbox[0])) // 2, card_y + 168), lead_line1, font=font_lead, fill=(65, 82, 72, 255))
    card_draw.text((card_x + (card_w - (l2_bbox[2] - l2_bbox[0])) // 2, card_y + 208), lead_line2, font=font_lead, fill=(90, 105, 96, 255))

    sep_y = card_y + 262
    card_draw.line([(card_x + 60, sep_y), (card_x + card_w - 60, sep_y)], fill=(235, 240, 236, 255), width=1)

    feats = [
        ("◆ 400種以上を収録", "島在住20年の撮りおろし"),
        ("◆ 色・季節で検索", "花の名前が分からなくてもOK"),
        ("◆ スマホで快適", "旅の道端散策のお供に")
    ]
    f_w = 280
    f_gap = 25
    f_start_x = card_x + (card_w - (f_w * 3 + f_gap * 2)) // 2
    f_y = card_y + 288

    font_f_title = get_font(FONT_UD_B, 20)
    font_f_sub = get_font(FONT_UD_R, 16)

    for i, (ft, fs) in enumerate(feats):
        fx = f_start_x + i * (f_w + f_gap)
        card_draw.rounded_rectangle([fx, f_y, fx + f_w, f_y + 115], radius=16, fill=(247, 249, 248, 255), outline=(230, 236, 232, 255), width=1)
        
        ft_bbox = font_f_title.getbbox(ft)
        card_draw.text((fx + (f_w - (ft_bbox[2] - ft_bbox[0])) // 2, f_y + 26), ft, font=font_f_title, fill=(35, 75, 52, 255))

        fs_bbox = font_f_sub.getbbox(fs)
        card_draw.text((fx + (f_w - (fs_bbox[2] - fs_bbox[0])) // 2, f_y + 68), fs, font=font_f_sub, fill=(105, 118, 110, 255))

    # CTAフッター
    cta_y = card_y + 440
    font_cta_lead = get_font(FONT_UD_B, 24)
    c_lead = "＼ プロフィールのリンクから遊びに来てね ／"
    c_bbox = font_cta_lead.getbbox(c_lead)
    card_draw.text((card_x + (card_w - (c_bbox[2] - c_bbox[0])) // 2, cta_y), c_lead, font=font_cta_lead, fill=(205, 92, 60, 255))

    sbox_w = 600
    sbox_h = 62
    sbox_x = card_x + (card_w - sbox_w) // 2
    sbox_y = cta_y + 48
    
    draw_soft_shadow(canvas, (sbox_x, sbox_y, sbox_x + sbox_w, sbox_y + sbox_h), radius=31, blur=8, offset=(0, 3), color=(0, 0, 0, 15))
    card_draw.rounded_rectangle([sbox_x, sbox_y, sbox_x + sbox_w, sbox_y + sbox_h], radius=31, fill=(255, 255, 255, 255), outline=(200, 212, 204, 255), width=2)
    
    draw_search_icon(card_draw, sbox_x + 36, sbox_y + 31, radius=13, width=3, color=(70, 90, 80, 255))

    font_sb_txt = get_font(FONT_UD_B, 24)
    card_draw.text((sbox_x + 65, sbox_y + 17), "奄美の草花さんぽ帖", font=font_sb_txt, fill=(45, 60, 52, 255))

    sbtn_w = 115
    sbtn_h = 48
    sbtn_x = sbox_x + sbox_w - sbtn_w - 7
    sbtn_y = sbox_y + 7
    card_draw.rounded_rectangle([sbtn_x, sbtn_y, sbtn_x + sbtn_w, sbtn_y + sbtn_h], radius=24, fill=(45, 95, 68, 255))
    font_sbtn = get_font(FONT_UD_B, 19)
    card_draw.text((sbtn_x + 28, sbtn_y + 13), "検 索", font=font_sbtn, fill=(255, 255, 255, 255))

    font_foot_note = get_font(FONT_UD_R, 18)
    note_text = "無料で見られるWeb植物図鑑 ｜ 400種以上の写真掲載中"
    n_bbox = font_foot_note.getbbox(note_text)
    nw = n_bbox[2] - n_bbox[0]
    card_draw.text((card_x + (card_w - nw) // 2, card_y + 580), note_text, font=font_foot_note, fill=(130, 142, 136, 255))

    out_path = os.path.join(OUT_DIR, "amami_intro_style_b.png")
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"Saved Style B to {out_path}")
    return out_path

if __name__ == "__main__":
    generate_style_a()
    generate_style_b()
