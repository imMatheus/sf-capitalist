from pathlib import Path
from PIL import Image, ImageDraw


OUT_DIR = Path("src/assets/businesses")
SIZE = 512
SCALE = 4
BG = "#607780"
OUTLINE = "#303235"
SHADOW = "#475a61"
WHITE = "#f1eee5"
YELLOW = "#f8d94b"
ORANGE = "#d9823a"
RED = "#cc4d3d"
TEAL = "#55c7c9"
BLUE = "#6bb5de"
DARK = "#3b3e42"
MID = "#777a7d"
LIGHT = "#b8c0bf"
GREEN = "#83c764"


def canvas():
    image = Image.new("RGBA", (SIZE * SCALE, SIZE * SCALE), BG)
    return image, ImageDraw.Draw(image)


def p(points):
    return [(int(x * SCALE), int(y * SCALE)) for x, y in points]


def box(x1, y1, x2, y2):
    return tuple(int(v * SCALE) for v in (x1, y1, x2, y2))


def w(value):
    return int(value * SCALE)


def save(image, name):
    image = image.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    image.save(OUT_DIR / f"{name}.png")


def rounded(draw, xy, radius, fill, outline=OUTLINE, width=10):
    draw.rounded_rectangle(box(*xy), radius=w(radius), fill=fill, outline=outline, width=w(width))


def ellipse(draw, xy, fill, outline=OUTLINE, width=10):
    draw.ellipse(box(*xy), fill=fill, outline=outline, width=w(width))


def line(draw, points, fill=OUTLINE, width=10):
    draw.line(p(points), fill=fill, width=w(width), joint="curve")


def single_gpu_rig():
    image, draw = canvas()
    draw.polygon(p([(102, 300), (400, 300), (428, 336), (76, 336)]), fill=SHADOW)
    rounded(draw, (112, 166, 398, 292), 24, DARK, width=12)
    rounded(draw, (136, 190, 374, 268), 16, "#4f5358", width=7)
    ellipse(draw, (218, 185, 306, 273), TEAL, width=8)
    ellipse(draw, (244, 211, 280, 247), "#2b777c", width=5)
    for angle in [(257, 192, 270, 232), (286, 226, 246, 240), (258, 266, 246, 226), (220, 226, 260, 214)]:
        line(draw, [(angle[0], angle[1]), (angle[2], angle[3])], fill="#d8f3f3", width=8)
    rounded(draw, (94, 198, 124, 276), 8, ORANGE, width=6)
    rounded(draw, (386, 198, 418, 276), 8, ORANGE, width=6)
    line(draw, [(150, 152), (150, 110), (208, 110), (208, 152)], fill=OUTLINE, width=14)
    line(draw, [(316, 152), (316, 110), (374, 110), (374, 152)], fill=OUTLINE, width=14)
    return image


def render_rack():
    image, draw = canvas()
    draw.polygon(p([(150, 346), (386, 346), (418, 382), (118, 382)]), fill=SHADOW)
    rounded(draw, (150, 92, 366, 348), 22, DARK, width=12)
    for y in [122, 174, 226, 278]:
        rounded(draw, (176, y, 340, y + 38), 10, "#565f64", width=5)
        for x in [198, 222, 246]:
            ellipse(draw, (x, y + 11, x + 15, y + 26), TEAL, width=3)
        line(draw, [(286, y + 19), (322, y + 19)], fill=YELLOW, width=5)
    rounded(draw, (118, 126, 168, 318), 14, "#43494d", width=8)
    rounded(draw, (348, 126, 398, 318), 14, "#43494d", width=8)
    return image


def inference_cluster():
    image, draw = canvas()
    draw.polygon(p([(108, 340), (410, 340), (442, 378), (78, 378)]), fill=SHADOW)
    for x, y, color in [(96, 190, GREEN), (194, 126, TEAL), (292, 190, BLUE)]:
        rounded(draw, (x, y, x + 126, y + 118), 18, "#4d5458", width=9)
        rounded(draw, (x + 19, y + 24, x + 107, y + 52), 7, color, width=5)
        ellipse(draw, (x + 38, y + 68, x + 88, y + 118), "#33383b", width=5)
    line(draw, [(160, 190), (258, 146), (356, 190)], fill=YELLOW, width=10)
    line(draw, [(160, 308), (258, 244), (356, 308)], fill=YELLOW, width=10)
    ellipse(draw, (235, 176, 281, 222), YELLOW, width=6)
    return image


def training_pod():
    image, draw = canvas()
    draw.polygon(p([(128, 352), (396, 352), (422, 386), (98, 386)]), fill=SHADOW)
    rounded(draw, (122, 112, 390, 342), 48, "#3f4449", width=12)
    rounded(draw, (158, 144, 354, 310), 32, "#58636a", width=8)
    for x in [184, 238, 292]:
        rounded(draw, (x, 158, x + 34, 296), 12, "#2f3438", width=4)
        line(draw, [(x + 17, 166), (x + 17, 286)], fill=TEAL, width=5)
    draw.polygon(p([(252, 154), (214, 246), (254, 238), (224, 314), (306, 210), (260, 220), (298, 154)]), fill=YELLOW, outline=OUTLINE)
    line(draw, [(252, 154), (214, 246), (254, 238), (224, 314), (306, 210), (260, 220), (298, 154), (252, 154)], width=8)
    return image


def colocation_hall():
    image, draw = canvas()
    draw.polygon(p([(118, 344), (402, 344), (432, 380), (88, 380)]), fill=SHADOW)
    rounded(draw, (118, 130, 208, 338), 12, "#35393d", width=9)
    rounded(draw, (214, 104, 316, 338), 12, "#42474b", width=9)
    rounded(draw, (322, 130, 412, 338), 12, "#35393d", width=9)
    for x, y1, y2 in [(142, 164, 306), (238, 138, 306), (346, 164, 306)]:
        for y in range(y1, y2, 28):
            line(draw, [(x, y), (x + 42, y)], fill=BLUE, width=4)
            ellipse(draw, (x + 52, y - 5, x + 62, y + 5), ORANGE, width=2)
    draw.polygon(p([(188, 338), (344, 338), (384, 378), (146, 378)]), fill=WHITE, outline=OUTLINE)
    line(draw, [(214, 352), (320, 352)], fill="#c2c2bb", width=5)
    return image


def asic_farm():
    image, draw = canvas()
    draw.polygon(p([(104, 342), (408, 342), (438, 378), (74, 378)]), fill=SHADOW)
    for x, y in [(92, 190), (196, 142), (300, 190)]:
        rounded(draw, (x, y, x + 126, y + 118), 18, "#55585b", width=9)
        ellipse(draw, (x + 24, y + 29, x + 78, y + 83), DARK, width=5)
        ellipse(draw, (x + 39, y + 44, x + 63, y + 68), TEAL, width=3)
        line(draw, [(x + 92, y + 34), (x + 110, y + 34)], fill=ORANGE, width=6)
        line(draw, [(x + 92, y + 58), (x + 110, y + 58)], fill=ORANGE, width=6)
        line(draw, [(x + 92, y + 82), (x + 110, y + 82)], fill=ORANGE, width=6)
    return image


def cloud_region():
    image, draw = canvas()
    draw.polygon(p([(100, 342), (410, 342), (442, 380), (70, 380)]), fill=SHADOW)
    ellipse(draw, (98, 142, 238, 278), WHITE, width=10)
    ellipse(draw, (188, 104, 342, 270), WHITE, width=10)
    ellipse(draw, (296, 150, 420, 278), WHITE, width=10)
    rounded(draw, (122, 218, 398, 314), 42, WHITE, width=10)
    for x in [158, 228, 298]:
        rounded(draw, (x, 244, x + 48, 330), 9, "#4e5559", width=5)
        line(draw, [(x + 13, 264), (x + 35, 264)], fill=TEAL, width=4)
        line(draw, [(x + 13, 286), (x + 35, 286)], fill=ORANGE, width=4)
    line(draw, [(206, 330), (252, 362), (322, 330)], fill=YELLOW, width=8)
    return image


def hyperscale_campus():
    image, draw = canvas()
    draw.polygon(p([(92, 350), (420, 350), (452, 386), (62, 386)]), fill=SHADOW)
    rounded(draw, (82, 214, 214, 346), 12, "#565d61", width=9)
    rounded(draw, (226, 168, 390, 346), 12, "#454b50", width=9)
    rounded(draw, (316, 224, 432, 346), 12, "#62696c", width=9)
    for x in [106, 136, 166, 252, 286, 320, 354, 340, 372, 404]:
        for y in [242, 276, 310] if x < 220 or x > 315 else [198, 232, 266, 300]:
            rounded(draw, (x, y, x + 14, y + 12), 3, TEAL, outline="#283034", width=2)
    ellipse(draw, (104, 128, 156, 214), LIGHT, width=7)
    ellipse(draw, (164, 116, 216, 214), LIGHT, width=7)
    line(draw, [(130, 128), (130, 92)], fill=OUTLINE, width=7)
    line(draw, [(190, 116), (190, 78)], fill=OUTLINE, width=7)
    line(draw, [(106, 370), (212, 338), (298, 370), (406, 338)], fill=ORANGE, width=8)
    return image


def ai_supercomputer():
    image, draw = canvas()
    draw.polygon(p([(86, 352), (426, 352), (458, 388), (56, 388)]), fill=SHADOW)
    rounded(draw, (104, 158, 408, 346), 30, "#3e454b", width=12)
    rounded(draw, (134, 188, 378, 316), 24, "#56616a", width=8)
    ellipse(draw, (196, 118, 316, 238), GREEN, width=10)
    ellipse(draw, (228, 150, 284, 206), "#2f6f44", width=6)
    for angle in [(256, 124, 256, 88), (314, 178, 354, 178), (256, 232, 256, 272), (198, 178, 158, 178)]:
        line(draw, [(angle[0], angle[1]), (angle[2], angle[3])], fill=YELLOW, width=8)
    for x in [146, 202, 258, 314]:
        rounded(draw, (x, 230, x + 42, 294), 8, "#2f3438", width=5)
        line(draw, [(x + 12, 248), (x + 30, 248)], fill=TEAL, width=4)
        line(draw, [(x + 12, 270), (x + 30, 270)], fill=ORANGE, width=4)
    line(draw, [(126, 336), (386, 336)], fill=BLUE, width=8)
    return image


def orbital_data_center():
    image, draw = canvas()
    draw.polygon(p([(100, 350), (410, 350), (444, 386), (70, 386)]), fill=SHADOW)
    ellipse(draw, (86, 94, 426, 350), "#2f3c46", width=12)
    ellipse(draw, (120, 130, 392, 314), "#647984", width=8)
    rounded(draw, (178, 164, 334, 302), 20, "#3f464c", width=9)
    for x in [202, 246, 290]:
        rounded(draw, (x, 186, x + 28, 276), 6, "#555f65", width=4)
        line(draw, [(x + 8, 206), (x + 20, 206)], fill=TEAL, width=3)
        line(draw, [(x + 8, 232), (x + 20, 232)], fill=YELLOW, width=3)
    line(draw, [(94, 250), (176, 218)], fill=BLUE, width=10)
    line(draw, [(336, 218), (418, 250)], fill=BLUE, width=10)
    draw.polygon(p([(70, 224), (142, 198), (154, 238), (82, 266)]), fill=YELLOW, outline=OUTLINE)
    draw.polygon(p([(370, 198), (442, 224), (430, 266), (358, 238)]), fill=YELLOW, outline=OUTLINE)
    line(draw, [(70, 224), (142, 198), (154, 238), (82, 266), (70, 224)], width=7)
    line(draw, [(370, 198), (442, 224), (430, 266), (358, 238), (370, 198)], width=7)
    ellipse(draw, (236, 78, 276, 118), WHITE, width=5)
    return image


def quick_upgrade():
    image, draw = canvas()
    draw.polygon(p([(108, 344), (402, 344), (432, 378), (78, 378)]), fill=SHADOW)
    rounded(draw, (134, 220, 378, 338), 18, "#4d5559", width=10)
    for x, y in [(154, 242), (218, 204), (282, 166)]:
        draw.polygon(
            p([(x, y + 52), (x + 86, y + 28), (x + 112, y + 58), (x + 28, y + 86)]),
            fill=YELLOW,
            outline=OUTLINE,
        )
        line(draw, [(x, y + 52), (x + 86, y + 28), (x + 112, y + 58), (x + 28, y + 86), (x, y + 52)], width=7)
        line(draw, [(x + 28, y + 86), (x + 28, y + 104), (x + 112, y + 76), (x + 112, y + 58)], fill=ORANGE, width=7)
    draw.polygon(p([(252, 84), (326, 158), (286, 158), (286, 256), (218, 256), (218, 158), (178, 158)]), fill=GREEN, outline=OUTLINE)
    line(draw, [(252, 84), (326, 158), (286, 158), (286, 256), (218, 256), (218, 158), (178, 158), (252, 84)], width=10)
    return image


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    icons = {
        "single-gpu-rig": single_gpu_rig,
        "render-rack": render_rack,
        "inference-cluster": inference_cluster,
        "training-pod": training_pod,
        "colocation-hall": colocation_hall,
        "asic-farm": asic_farm,
        "cloud-region": cloud_region,
        "hyperscale-campus": hyperscale_campus,
        "ai-supercomputer": ai_supercomputer,
        "orbital-data-center": orbital_data_center,
        "quick-upgrade": quick_upgrade,
    }

    for name, factory in icons.items():
        save(factory(), name)


if __name__ == "__main__":
    main()
