#!/usr/bin/env python3
"""Generate TSF Fitness PWA icons: 192, 512, and maskable-512.

Design: dark slate rounded square, three vertical bars representing
Train / Snap / Fuel. Pure geometry, no fonts, no network.
"""
from PIL import Image, ImageDraw

SLATE = (15, 23, 42, 255)      # #0f172a
BAR_1 = (56, 189, 248, 255)    # sky-400   (Train)
BAR_2 = (45, 212, 191, 255)    # teal-400  (Snap)
BAR_3 = (251, 146, 60, 255)    # orange-400 (Fuel)


def make_icon(size: int, rounded: bool, safe_zone: float) -> Image.Image:
    img = Image.new("RGBA", (size, size), SLATE)
    d = ImageDraw.Draw(img)
    if rounded:
        d.rounded_rectangle([0, 0, size - 1, size - 1], radius=size // 5, fill=SLATE)
    # Bars occupy the safe zone, centered, with equal gaps.
    inner = size * safe_zone
    bar_w = inner * 0.14
    gap = inner * 0.10
    total_w = 3 * bar_w + 2 * gap
    x0 = (size - total_w) / 2
    bar_h = inner * 0.52
    y0 = (size - bar_h) / 2
    heights = [bar_h, bar_h * 0.78, bar_h * 0.58]  # rising effort curve
    for i, (color, h) in enumerate(zip([BAR_1, BAR_2, BAR_3], heights)):
        bx = x0 + i * (bar_w + gap)
        by = y0 + (bar_h - h)
        d.rounded_rectangle(
            [bx, by, bx + bar_w, y0 + bar_h], radius=bar_w / 2, fill=color
        )
    return img


out = "/home/z/my-project/repo/public/icons"
import os
os.makedirs(out, exist_ok=True)

make_icon(192, rounded=True, safe_zone=0.72).save(f"{out}/icon-192.png")
make_icon(512, rounded=True, safe_zone=0.72).save(f"{out}/icon-512.png")
# Maskable: full-bleed square, content inside the 80% safe zone.
make_icon(512, rounded=False, safe_zone=0.60).save(f"{out}/icon-maskable-512.png")
make_icon(192, rounded=False, safe_zone=0.60).save(f"{out}/icon-maskable-192.png")
print("icons written:")
for f in sorted(os.listdir(out)):
    p = f"{out}/{f}"
    img = Image.open(p)
    print(f"  {f}: {img.size}, {os.path.getsize(p)} bytes")
