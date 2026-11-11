# Update Root.tsx
root_path = r'C:\Gravity\VIDEO_IROIRO\remotion_video\src\Root.tsx'
with open(root_path, 'r', encoding='utf-8') as f:
    r_text = f.read()

r_text = r_text.replace('transitionType: "filmBurn"', 'transitionType: "fade"')
with open(root_path, 'w', encoding='utf-8') as f:
    f.write(r_text)
print("Updated Root.tsx transitionType to fade")

# Update generate_carousel.py
gen_path = r'C:\Gravity\amamikusabana_2_new\insta_carousel\generate_carousel.py'
with open(gen_path, 'r', encoding='utf-8') as f:
    g_text = f.read()

g_text = g_text.replace('transitionType: "filmBurn"', 'transitionType: "fade"')
with open(gen_path, 'w', encoding='utf-8') as f:
    f.write(g_text)
print("Updated generate_carousel.py transitionType to fade")
