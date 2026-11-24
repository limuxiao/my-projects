from PIL import Image, ImageDraw

SIZE = 81
COLORS = {
    'normal': '#8a7d63',
    'active': '#b8860b',
}
OUT = 'src/assets/tabbar'


def new_canvas():
    return Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))


def draw_gold(color):
    im = new_canvas()
    d = ImageDraw.Draw(im)
    # 外圈 + 内圈
    d.ellipse([11, 11, 70, 70], outline=color, width=5)
    d.ellipse([19, 19, 62, 62], outline=color, width=2)
    # 货币符号 ¥
    d.line([(40, 26), (40, 56)], fill=color, width=4)
    d.line([(31, 32), (40, 41), (49, 32)], fill=color, width=4, joint='curve')
    d.line([(31, 44), (49, 44)], fill=color, width=4)
    d.line([(31, 52), (49, 52)], fill=color, width=4)
    return im


def draw_home(color):
    im = new_canvas()
    d = ImageDraw.Draw(im)
    # 屋顶
    d.line([(14, 38), (40, 16), (67, 38)], fill=color, width=5, joint='curve')
    # 房身
    d.line([(21, 36), (21, 66), (60, 66), (60, 36)], fill=color, width=5, joint='curve')
    # 门
    d.line([(34, 66), (34, 49), (47, 49), (47, 66)], fill=color, width=4, joint='curve')
    return im


def draw_me(color):
    im = new_canvas()
    d = ImageDraw.Draw(im)
    # 头
    d.ellipse([26, 15, 55, 44], outline=color, width=5)
    # 肩
    d.arc([16, 46, 65, 95], start=180, end=360, fill=color, width=5)
    return im


DRAWERS = {
    'gold': draw_gold,
    'home': draw_home,
    'me': draw_me,
}

for name, drawer in DRAWERS.items():
    for state, color in COLORS.items():
        drawer(color).save(f'{OUT}/{name}_{state}.png')

print('generated 6 icons in', OUT)
