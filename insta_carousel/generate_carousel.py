# -*- coding: utf-8 -*-
"""
奄美の草花さんぽ帖 Instagram 4:5 カルーセル画像生成スクリプト (v2)
使い方:
  python insta_carousel/generate_carousel.py --config insta_carousel/configs/sample.json --out-dir <出力先フォルダ> [--artifact-dir <プレビュー用フォルダ>]
  引数なしで実行した場合はデフォルトのサンプル設定で生成します。
"""
import os
import sys
import json
import argparse
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = r"C:\Gravity\amamikusabana_2_new"
IMG_DIR = os.path.join(BASE_DIR, "public", "images")
CAROUSEL_DIR = os.path.join(BASE_DIR, "insta_carousel")

FONT_MINCHO_B = r"C:\Windows\Fonts\yumindb.ttf"
FONT_MINCHO_R = r"C:\Windows\Fonts\yumin.ttf"
FONT_GOTHIC_M = r"C:\Windows\Fonts\YuGothM.ttc"
FONT_GOTHIC_B = r"C:\Windows\Fonts\YuGothB.ttc"

KINSOKU_HEAD = set("。、，．・：；！？）」』】〕〉》〙〗〟’”％‰℃°")
KINSOKU_TAIL = set("（「『【〔〈《〘〖〝‘“")

CIRCLED_NUMS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"]


def get_font(path, size):
    return ImageFont.truetype(path, size)


def resolve_img_path(img_path):
    if os.path.isabs(img_path) and os.path.exists(img_path):
        return img_path
    p = os.path.join(IMG_DIR, img_path)
    if os.path.exists(p):
        return p
    p2 = os.path.join(BASE_DIR, img_path)
    if os.path.exists(p2):
        return p2
    raise FileNotFoundError(f"Image not found: {img_path} (searched in {IMG_DIR})")


def crop_to_aspect(img, target_w, target_h, focus_x=0.5, focus_y=0.5):
    """指定サイズにアスペクト比を維持してクロップ＆リサイズする"""
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


def draw_text_with_shadow(base_img, xy, text, font, fill=(255, 255, 255), shadow_color=(0, 0, 0, 190), blur=8, offset=(0, 3)):
    """写真の上でも文字がクッキリ浮かび上がる上品なドロップシャドウ付きテキスト描画"""
    txt_layer = Image.new("RGBA", base_img.size, (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(txt_layer)
    sx = xy[0] + offset[0]
    sy = xy[1] + offset[1]
    s_draw.text((sx, sy), text, font=font, fill=shadow_color)
    txt_layer = txt_layer.filter(ImageFilter.GaussianBlur(blur))

    t_draw = ImageDraw.Draw(txt_layer)
    t_draw.text(xy, text, font=font, fill=fill)
    base_img.alpha_composite(txt_layer)


def draw_wrapped_text(draw, text, x, y, max_w, font, fill, line_spacing=18):
    """禁則処理付きの自動改行テキスト描画（大きめ文字対応）"""
    paragraphs = text.split("\n")
    curr_y = y
    for para in paragraphs:
        lines = []
        line = ""
        for ch in para:
            test_line = line + ch
            bbox = draw.textbbox((0, 0), test_line, font=font)
            if bbox[2] - bbox[0] > max_w and line:
                if ch in KINSOKU_HEAD:
                    lines.append(line + ch)
                    line = ""
                elif line[-1] in KINSOKU_TAIL:
                    moved = line[-1]
                    lines.append(line[:-1])
                    line = moved + ch
                else:
                    lines.append(line)
                    line = ch
            else:
                line = test_line
        if line:
            if len(line) >= 1 and line[0] in KINSOKU_HEAD and lines:
                lines[-1] = lines[-1] + line[0]
                line = line[1:]
            if line:
                lines.append(line)

        for ln in lines:
            draw.text((x, curr_y), ln, font=font, fill=fill)
            curr_y += font.size + line_spacing
    return curr_y


def save_outputs(img, filename, out_dirs):
    rgb = img.convert("RGB")
    saved = []
    for d in out_dirs:
        if not d:
            continue
        try:
            os.makedirs(d, exist_ok=True)
            p = os.path.join(d, filename)
            rgb.save(p, quality=95)
            saved.append(p)
        except PermissionError:
            pass
    for s in saved:
        print("Saved:", s)


# ==============================================================================
# 1枚目（表紙）：写真を全面に出し、グリッドでもスマホでも1秒で読める特大文字！
# 上部のメイン写真は4:3の横長構図をほぼそのまま活かし、下部をボケグラデーションで繋ぐ
# ==============================================================================
def render_slide_1(cover_cfg, out_dirs):
    W, H = 1080, 1350
    base = Image.new("RGBA", (W, H), (24, 34, 26, 255))

    img_path = resolve_img_path(cover_cfg["image"])
    focus_x = float(cover_cfg.get("focus_x", 0.5))
    focus_y = float(cover_cfg.get("focus_y", 0.5))

    raw_photo = Image.open(img_path).convert("RGB")
    bg_blur = crop_to_aspect(raw_photo, W, H).filter(ImageFilter.GaussianBlur(35))
    base.paste(bg_blur, (0, 0))

    top_photo = crop_to_aspect(raw_photo, W, 900, focus_x=focus_x, focus_y=focus_y).convert("RGBA")

    mask = Image.new("L", (W, 900), 255)
    m_draw = ImageDraw.Draw(mask)
    for y in range(650, 900):
        alpha = int(255 * (1.0 - (y - 650) / 250.0))
        m_draw.line([(0, y), (W, y)], fill=alpha)
    base.paste(top_photo, (0, 0), mask)

    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(grad)
    for y in range(0, 220):
        a = int(140 * (1.0 - y / 220.0))
        g_draw.line([(0, y), (W, y)], fill=(15, 22, 16, a))
    for y in range(620, H):
        ratio = min(1.0, (y - 620) / 320.0)
        a = int(225 * ratio)
        g_draw.line([(0, y), (W, y)], fill=(20, 30, 22, a))
    base.alpha_composite(grad)

    draw = ImageDraw.Draw(base)

    # 上部センター：ブランド題字
    f_brand = get_font(FONT_MINCHO_B, 34)
    brand_str = "―  奄美の草花さんぽ帖  ―"
    bw = draw.textbbox((0, 0), brand_str, font=f_brand)[2]
    draw_text_with_shadow(base, ((W - bw) // 2, 52), brand_str, f_brand, fill=(255, 255, 255), blur=6)

    # 中央やや下：季節タグバッジ
    draw = ImageDraw.Draw(base)
    f_badge = get_font(FONT_GOTHIC_B, 30)
    badge_txt = f" {cover_cfg['badge'].strip()} "
    badge_rgb = tuple(cover_cfg.get("badge_rgb", [178, 52, 52])) + (245,)
    bbw = draw.textbbox((0, 0), badge_txt, font=f_badge)[2]
    bx = (W - bbw - 48) // 2
    draw.rounded_rectangle([bx, 760, bx + bbw + 48, 824], radius=32, fill=badge_rgb)
    draw.text((bx + 24, 774), badge_txt, font=f_badge, fill=(255, 255, 255))

    # 特大メインタイトル（文字数に応じて72pt〜58ptに自動調整）
    t1 = cover_cfg["title_line1"]
    t2 = cover_cfg["title_line2"]
    max_len = max(len(t1), len(t2))
    main_pt = 72 if max_len <= 11 else (64 if max_len <= 13 else 56)
    f_main = get_font(FONT_MINCHO_B, main_pt)
    w1 = draw.textbbox((0, 0), t1, font=f_main)[2]
    w2 = draw.textbbox((0, 0), t2, font=f_main)[2]
    draw_text_with_shadow(base, ((W - w1) // 2, 862), t1, f_main, fill=(255, 255, 255), blur=10, offset=(0, 4))
    draw_text_with_shadow(base, ((W - w2) // 2, 958), t2, f_main, fill=(255, 235, 195), blur=10, offset=(0, 4))

    # サブコピー（36pt）
    f_sub = get_font(FONT_MINCHO_B, 36)
    s1 = cover_cfg["subtitle"]
    sw1 = draw.textbbox((0, 0), s1, font=f_sub)[2]
    draw_text_with_shadow(base, ((W - sw1) // 2, 1084), s1, f_sub, fill=(235, 242, 235), blur=6)

    # 下部スワイプ誘導バー（30pt）
    draw = ImageDraw.Draw(base)
    draw.line([(80, 1185), (1000, 1185)], fill=(200, 169, 126, 160), width=2)
    f_cta = get_font(FONT_GOTHIC_B, 30)
    cover_plant = cover_cfg.get("cover_plant_label", "")
    cta_str = f"表紙：{cover_plant}   スワイプで図鑑へ ＞＞" if cover_plant else "スワイプして草花図鑑をめくる ＞＞"
    cw = draw.textbbox((0, 0), cta_str, font=f_cta)[2]
    draw.text(((W - cw) // 2, 1218), cta_str, font=f_cta, fill=(255, 225, 175))

    save_outputs(base, "slide_01_cover.png", out_dirs)


# ==============================================================================
# 2〜N-1枚目（植物図鑑スライド）：
# 4:3横長写真を「横幅1080pxいっぱい（1080×810px）」に1ミリも切らずドカンと配置！
# 図鑑Noは非公開のため絶対に入れず、特大の植物名（58pt）と太明朝解説（33pt）を配置
# ==============================================================================
def render_plant_slide(filename, num, plant_cfg, page, total_pages, out_dirs):
    W, H = 1080, 1350
    img = Image.new("RGBA", (W, H), (247, 244, 237, 255))

    name = plant_cfg["name"]
    sub_name = plant_cfg.get("sub_name", "")
    main_img = plant_cfg["main_img"]
    sub_img = plant_cfg.get("sub_img", "")
    sub_cap = plant_cfg.get("sub_cap", "")
    catchphrase = plant_cfg["catchphrase"]
    short_desc = plant_cfg["short_desc"]
    point = plant_cfg["point"]
    season = plant_cfg["season"]
    accent_rgb = tuple(plant_cfg.get("accent_rgb", [46, 92, 62]))

    # 1. 上部に 4:3 のメイン写真を「横幅1080px × 高さ810px（完全な4:3比率！）」で端から端まで配置！
    photo_main = Image.open(resolve_img_path(main_img)).convert("RGB")
    photo_main = crop_to_aspect(photo_main, 1080, 810)
    img.paste(photo_main, (0, 0))

    # 写真上部にさりげないグラデーションを入れて、左上の番号バッジを見やすくする
    top_grad = Image.new("RGBA", (W, 140), (0, 0, 0, 0))
    tg_draw = ImageDraw.Draw(top_grad)
    for y in range(140):
        a = int(130 * (1.0 - y / 140.0))
        tg_draw.line([(0, y), (W, y)], fill=(0, 0, 0, a))
    img.alpha_composite(top_grad, (0, 0))

    draw = ImageDraw.Draw(img)

    # 左上：番号＆ブランド名バッジ（図鑑Noは非開示のため入れない）
    f_top_num = get_font(FONT_GOTHIC_B, 27)
    badge_label = f"{num} ｜ 奄美の草花さんぽ帖"
    blw = draw.textbbox((0, 0), badge_label, font=f_top_num)[2]
    draw.rounded_rectangle([32, 28, 62 + blw + 28, 92], radius=8, fill=(25, 32, 26, 210))
    draw.rectangle([32, 28, 44, 92], fill=accent_rgb)
    draw.text((62, 44), badge_label, font=f_top_num, fill=(255, 255, 255))

    # 右上：季節バッジ（26pt）
    f_season = get_font(FONT_GOTHIC_B, 26)
    sw = draw.textbbox((0, 0), season, font=f_season)[2]
    sx = W - sw - 68
    draw.rounded_rectangle([sx, 28, W - 28, 92], radius=32, fill=accent_rgb)
    draw.text((sx + 20, 44), season, font=f_season, fill=(255, 255, 255))

    # 写真とテキストの境界ライン
    draw.rectangle([0, 806, W, 814], fill=accent_rgb)

    # 右下（写真の境界線上）：2枚目の4:3サブ写真（336×252px）を白いフチ付きで配置（sub_img指定時）
    if sub_img:
        sub_w, sub_h = 336, 252
        sub_x, sub_y = W - sub_w - 32, 810 - sub_h + 42

        shadow = Image.new("RGBA", (sub_w + 40, sub_h + 40), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow)
        s_draw.rounded_rectangle([15, 15, 15 + sub_w + 12, 15 + sub_h + 12], radius=8, fill=(0, 0, 0, 95))
        shadow = shadow.filter(ImageFilter.GaussianBlur(10))
        img.alpha_composite(shadow, (sub_x - 21, sub_y - 15))

        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([sub_x - 6, sub_y - 6, sub_x + sub_w + 6, sub_y + sub_h + 6], radius=6, fill=(255, 255, 255, 255))
        photo_sub = Image.open(resolve_img_path(sub_img)).convert("RGB")
        photo_sub = crop_to_aspect(photo_sub, sub_w, sub_h)
        img.paste(photo_sub, (sub_x, sub_y))

        if sub_cap:
            draw = ImageDraw.Draw(img)
            draw.rectangle([sub_x, sub_y + sub_h - 44, sub_x + sub_w, sub_y + sub_h], fill=(20, 26, 22, 220))
            f_subcap = get_font(FONT_GOTHIC_B, 20)
            scw = draw.textbbox((0, 0), sub_cap, font=f_subcap)[2]
            draw.text((sub_x + (sub_w - scw) // 2, sub_y + sub_h - 35), sub_cap, font=f_subcap, fill=(255, 255, 255))

    # 2. 下部テキストエリア（y = 830 〜 1350）
    draw = ImageDraw.Draw(img)
    f_catch = get_font(FONT_GOTHIC_B, 29)
    f_name = get_font(FONT_MINCHO_B, 58)
    f_subname = get_font(FONT_MINCHO_B, 28)
    f_desc = get_font(FONT_MINCHO_B, 33)

    draw.text((48, 836), f"◆ {catchphrase}", font=f_catch, fill=accent_rgb)
    draw.text((48, 886), name, font=f_name, fill=(22, 30, 24))
    draw.text((52, 960), sub_name, font=f_subname, fill=(88, 100, 90))

    draw_wrapped_text(draw, short_desc, x=48, y=1016, max_w=984, font=f_desc, fill=(35, 45, 37), line_spacing=20)

    # 最下部：観察ポイント帯（28pt）
    draw.rounded_rectangle([44, 1218, 1036, 1308], radius=10, fill=(230, 235, 226, 255))
    draw.rectangle([44, 1218, 56, 1308], fill=accent_rgb)

    f_pt = get_font(FONT_GOTHIC_B, 28)
    draw.text((76, 1246), f"● 観察ポイント：{point}", font=f_pt, fill=(30, 44, 34))

    f_page = get_font(FONT_GOTHIC_B, 24)
    draw.text((942, 1250), f"{page} / {total_pages}", font=f_page, fill=(110, 120, 112))

    save_outputs(img, filename, out_dirs)


# ==============================================================================
# 最終枚目（誘導カード）：
# ・草花デジタル図鑑：「奄美の草花さんぽ帖」
# ・奄美のさんぽブログ：「奄美☆かめとらの奄美生活」
# ==============================================================================
def render_slide_outro(filename, plants_list, out_dirs):
    W, H = 1080, 1350
    img = Image.new("RGBA", (W, H), (32, 46, 36, 255))
    draw = ImageDraw.Draw(img)

    draw.rectangle([24, 24, W - 24, H - 24], outline=(150, 168, 152), width=2)

    f_sub_h = get_font(FONT_GOTHIC_B, 26)
    f_main_h = get_font(FONT_MINCHO_B, 54)

    sh = "世界自然遺産・奄美大島の植物記録"
    shw = draw.textbbox((0, 0), sh, font=f_sub_h)[2]
    draw.text(((W - shw) // 2, 64), sh, font=f_sub_h, fill=(212, 182, 138))

    mh = "もっと詳しく見たい方へ"
    mhw = draw.textbbox((0, 0), mh, font=f_main_h)[2]
    draw.text(((W - mhw) // 2, 112), mh, font=f_main_h, fill=(255, 255, 255))

    draw.line([(W // 2 - 60, 192), (W // 2 + 60, 192)], fill=(212, 182, 138), width=4)

    # 今回登場した植物の4:3写真サムネイル（最大3枚を横並び）
    thumbs_data = plants_list[:3]
    n_thumbs = len(thumbs_data)
    if n_thumbs == 3:
        tw, th = 296, 222
        gap = 32
        start_x = (W - (tw * 3 + gap * 2)) // 2
    elif n_thumbs == 2:
        tw, th = 360, 270
        gap = 48
        start_x = (W - (tw * 2 + gap)) // 2
    else:
        tw, th = 360, 270
        gap = 0
        start_x = (W - tw) // 2

    f_tcap = get_font(FONT_GOTHIC_B, 24)

    for idx, p_cfg in enumerate(thumbs_data):
        t_img = p_cfg["main_img"]
        c_num = CIRCLED_NUMS[idx] if idx < len(CIRCLED_NUMS) else f"{idx+1}."
        t_name = f"{c_num} {p_cfg['name']}"
        tx = start_x + idx * (tw + gap)
        ty = 224
        draw.rounded_rectangle([tx - 5, ty - 5, tx + tw + 5, ty + th + 5], radius=6, fill=(255, 255, 255, 255))
        p = Image.open(resolve_img_path(t_img)).convert("RGB")
        p = crop_to_aspect(p, tw, th)
        img.paste(p, (tx, ty))
        draw = ImageDraw.Draw(img)
        nw = draw.textbbox((0, 0), t_name, font=f_tcap)[2]
        draw.text((tx + (tw - nw) // 2, ty + th + 16), t_name, font=f_tcap, fill=(235, 242, 235))

    # 2つのメインサイト紹介カード
    f_guide = get_font(FONT_GOTHIC_B, 32)
    g_txt = "▼ プロフィールのリンクからすぐ開けます ▼"
    gw = draw.textbbox((0, 0), g_txt, font=f_guide)[2]
    draw.text(((W - gw) // 2, 520), g_txt, font=f_guide, fill=(255, 225, 170))

    f_label = get_font(FONT_GOTHIC_B, 26)
    f_site = get_font(FONT_MINCHO_B, 46)
    f_desc = get_font(FONT_GOTHIC_M, 28)

    # カード1：草花デジタル図鑑「奄美の草花さんぽ帖」
    draw.rounded_rectangle([60, 584, 1020, 854], radius=14, fill=(247, 244, 237, 255))
    draw.rounded_rectangle([60, 584, 80, 854], radius=6, fill=(46, 92, 62, 255))
    draw.rounded_rectangle([104, 608, 430, 656], radius=6, fill=(46, 92, 62, 255))
    draw.text((124, 617), "① 草花デジタル図鑑", font=f_label, fill=(255, 255, 255))

    draw.text((104, 674), "『 奄美の草花さんぽ帖 』", font=f_site, fill=(24, 42, 30))
    draw.text((108, 748), "300種以上の草花を「花の色」や「咲く季節」から", font=f_desc, fill=(60, 72, 62))
    draw.text((108, 790), "パッと探せるオンライン写真図鑑です。", font=f_desc, fill=(60, 72, 62))

    # カード2：奄美のさんぽブログ「奄美☆かめとらの奄美生活」
    draw.rounded_rectangle([60, 884, 1020, 1154], radius=14, fill=(247, 244, 237, 255))
    draw.rounded_rectangle([60, 884, 80, 1154], radius=6, fill=(166, 78, 46, 255))
    draw.rounded_rectangle([104, 908, 430, 956], radius=6, fill=(166, 78, 46, 255))
    draw.text((124, 917), "② 奄美のさんぽブログ", font=f_label, fill=(255, 255, 255))

    draw.text((104, 974), "『 奄美☆かめとらの奄美生活 』", font=f_site, fill=(48, 30, 22))
    draw.text((108, 1048), "毎日の何気ない散歩道で見つけた草花の記録や、", font=f_desc, fill=(60, 72, 62))
    draw.text((108, 1090), "島の季節の空気感を綴っています。", font=f_desc, fill=(60, 72, 62))

    # 最下部：保存＆フォロー促進ボタン（特大31pt）
    draw.rounded_rectangle([60, 1196, 1020, 1288], radius=12, fill=(212, 182, 138, 255))
    f_bot = get_font(FONT_GOTHIC_B, 31)
    b_txt = "★ 右下の【保存】でマイ図鑑に！ フォローも大歓迎です"
    bw = draw.textbbox((0, 0), b_txt, font=f_bot)[2]
    draw.text(((W - bw) // 2, 1226), b_txt, font=f_bot, fill=(24, 34, 26))

    save_outputs(img, filename, out_dirs)


DEFAULT_CONFIG = {
    "cover": {
        "image": "0078_02.jpg",
        "focus_x": 0.45,
        "focus_y": 0.5,
        "badge": "10月の奄美｜秋の実りと野草図鑑",
        "badge_rgb": [178, 52, 52],
        "title_line1": "サンゴ礁に実る",
        "title_line2": "小さな『赤いハート』",
        "subtitle": "秋の散歩道で出会った、愛おしい草花3選",
        "cover_plant_label": "ハリツルマサキ（ハートツリー）",
    },
    "plants": [
        {
            "name": "ハリツルマサキ",
            "sub_name": "方言名：マッコウ ／ 別名：ハートツリー",
            "main_img": "0078_03.jpg",
            "sub_img": "0078_04.jpg",
            "sub_cap": "5mmほどの可愛い白い花",
            "catchphrase": "サンゴ礁の岩場に実る、小さな赤いハート",
            "short_desc": "ツヤのある小さな葉の間から、秋に約6mmの『ハート型』の赤い実が顔を出します。\n花言葉は「小さな幸せ」。盆栽としても愛される島の宝物です。",
            "point": "枝の鋭いトゲと、実が割れて覗く赤いタネ",
            "season": "10月〜1月 結実",
            "accent_rgb": [168, 52, 52],
        },
        {
            "name": "オオムラサキシキブ",
            "sub_name": "奄美方言：ワレギ（シソ科）",
            "main_img": "0239_01.jpg",
            "sub_img": "0239_00.jpg",
            "sub_cap": "初夏に咲く淡紫色の花",
            "catchphrase": "潮風に負けない、ツヤ葉と紫の宝石",
            "short_desc": "島の強い潮風に耐えるため、本土のものより葉が大きく肉厚でツヤがあるのが特徴。\n秋になると、枝いっぱいに鮮やかな紫色の実をたわわに実らせます。",
            "point": "大きなツヤツヤの葉と、びっしり実る紫の実",
            "season": "10月〜11月 結実",
            "accent_rgb": [107, 58, 158],
        },
        {
            "name": "サイヨウシャジン",
            "sub_name": "細葉沙参（キキョウ科）",
            "main_img": "0260_00.jpg",
            "sub_img": "0260_06.jpg",
            "sub_cap": "長く突き出す白い雌しべ",
            "catchphrase": "秋の野原で涼やかに揺れる、紫の小さなベル",
            "short_desc": "ススキ草原や岬の道端で、壺のようにすぼまった淡紫色の釣鐘花をたくさん咲かせます。\n春の若芽は「トトキ」と呼ばれる美味しい山菜としても知られています。",
            "point": "花の先からちょこんと飛び出した長い雌しべ",
            "season": "10月〜11月 開花",
            "accent_rgb": [64, 82, 156],
        },
    ],
}


def run_from_config(cfg, out_dirs):
    plants = cfg["plants"]
    total_pages = len(plants) + 2

    render_slide_1(cfg["cover"], out_dirs)

    for idx, p_cfg in enumerate(plants):
        slide_num = idx + 2
        num_str = f"{idx + 1:02d}"
        fname = f"slide_{slide_num:02d}_plant{idx + 1}.png"
        render_plant_slide(fname, num_str, p_cfg, slide_num, total_pages, out_dirs)

    outro_fname = f"slide_{total_pages:02d}_outro.png"
    render_slide_outro(outro_fname, plants, out_dirs)

    if "caption" in cfg and cfg["caption"]:
        for d in out_dirs:
            if not d:
                continue
            try:
                os.makedirs(d, exist_ok=True)
                cap_path = os.path.join(d, "caption.txt")
                with open(cap_path, "w", encoding="utf-8") as f:
                    f.write(cfg["caption"])
                print("Saved caption:", cap_path)
            except PermissionError:
                pass


def main():
    parser = argparse.ArgumentParser(description="Generate Instagram Carousel (1080x1350) for Amami Kusabana Sanpo.")
    parser.add_argument("--config", type=str, default="", help="Path to JSON config file")
    parser.add_argument("--out-dir", type=str, default="", help="Output directory path")
    parser.add_argument("--artifact-dir", type=str, default="", help="Optional artifact directory path for preview")
    args = parser.parse_args()

    if args.config:
        with open(args.config, "r", encoding="utf-8") as f:
            cfg = json.load(f)
    else:
        cfg = DEFAULT_CONFIG

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    default_out = os.path.join(CAROUSEL_DIR, "output", f"carousel_{timestamp}")
    out_dir = args.out_dir if args.out_dir else default_out

    out_dirs = [out_dir]
    if args.artifact_dir:
        out_dirs.append(args.artifact_dir)

    run_from_config(cfg, out_dirs)


if __name__ == "__main__":
    main()
