#!/usr/bin/env python3
"""Generate TSF Fitness PWA icons: 192, 512, and maskable-192/512.

Design: dark slate rounded square, three vertical bars representing
Train / Snap / Fuel. Pure geometry, no fonts, no network.

Usage: python3 scripts/gen_icons.py  (from anywhere; writes to
<path-to-this-repo>/public/icons)
"""
import os
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
    # Bars occupy the safe zone, centered, with equal gaps. The safe_zone
    # is more conservative than the 80% maskable guideline (0.60 vs 0.80),
    # keeping the mark clear of any rounded-corner clipping.
    inner = size * safe_zone
    bar_w = inner * 0.14
    gap = inner * 0.10
    total_w = 3 * bar_w + 2 * gap
    x0 = (size - total_w) / 2
    bar_h = inner * 0.52
    y0 = (size - bar_h) / 2
    heights = [bar_h, bar_h * 0.78, bar_h * 0.58]
    # Descending bar heights read as a staircase; the accent colors map
    # them to Train / Snap / Fuel.
    for i, (color, h) in enumerate(zip([BAR_1, BAR_2, BAR_3], heights)):
        bx = x0 + i * (bar_w + gap)
        by = y0 + (bar_h - h)
        d.rounded_rectangle(
            [bx, by, bx + bar_w, y0 + bar_h], radius=bar_w / 2, fill=color
        )
    return img


def main() -> None:
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(repo_root, "public", "icons")
    os.makedirs(out, exist_ok=True)

    make_icon(192, rounded=True, safe_zone=0.72).save(os.path.join(out, "icon-192.png"))
    make_icon(512, rounded=True, safe_zone=0.72).save(os.path.join(out, "icon-512.png"))
    # Maskable: full-bleed square, content inside the 80% safe zone.
    make_icon(192, rounded=False, safe_zone=0.60).save(
        os.path.join(out, "icon-maskable-192.png")
    )
    make_icon(512, rounded=False, safe_zone=0.60).save(
        os.path.join(out, "icon-maskable-512.png")
    )
    for f in sorted(os.listdir(out)):
        img = Image.open(os.path.join(out, f))
        print(f"  {f}: {img.size}")


if __name__ == "__main__":
    main()
