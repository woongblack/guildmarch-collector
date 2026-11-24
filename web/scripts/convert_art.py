"""Site sizes for the page art drawn from PAGE_IMAGE_BRIEF.md (2026-11-10).

Icons and marks are trimmed to their visible edge and centred at 92% of a square, like the badges;
banners keep their shape and are sized by width. Run from web/: python3 scripts/convert_art.py
"""
from pathlib import Path

from PIL import Image

SRC = Path("image-sources")
OUT = Path("public/images")


def square(path: Path, sizes, dest: str):
    im = Image.open(path).convert("RGBA")
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
    side = round(max(im.size) / 0.92)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2), im)
    for s in sizes:
        out = OUT / dest.format(size=s)
        out.parent.mkdir(parents=True, exist_ok=True)
        canvas.resize((s, s), Image.LANCZOS).save(out, "WEBP", quality=88, method=6)


def by_width(path: Path, widths, dest: str, quality=82):
    im = Image.open(path)
    im = im.convert("RGBA") if im.mode == "RGBA" else im.convert("RGB")
    if im.mode == "RGBA":
        im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox())
    for w in widths:
        out = OUT / dest.format(size=w)
        out.parent.mkdir(parents=True, exist_ok=True)
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(out, "WEBP", quality=quality, method=6)


for p in sorted((SRC / "glossary").glob("*.png")):
    square(p, (64, 128), f"glossary/{p.stem}-{{size}}.webp")
for p in sorted((SRC / "glossary/categories").glob("*.png")):
    square(p, (64, 128), f"glossary/cat-{p.stem}-{{size}}.webp")
square(SRC / "guild-awards/04-comeback.png", (96, 192), "awards/comeback-{size}.webp")
by_width(SRC / "factions/banner-red.png", (120, 240), "factions/red-{size}.webp")
by_width(SRC / "factions/banner-blue.png", (120, 240), "factions/blue-{size}.webp")
by_width(SRC / "pages/chronicle-header.png", (800, 1200), "pages/chronicle-{size}.webp", quality=74)
square(SRC / "pages/before-week-one.png", (128, 256), "pages/before-week-one-{size}.webp")


# Banner charges (GUILD_BANNER_BRIEF.md): pure white with the alpha kept, faint generation dust at
# the edges cleared, trimmed and centred like the icons. The banner uses them as a mask.
def charge(path: Path, out: Path):
    im = Image.open(path).convert("RGBA")
    alpha = im.getchannel("A").point(lambda a: 0 if a < 8 else a)
    white = Image.new("RGBA", im.size, (255, 255, 255, 0))
    white.putalpha(alpha)
    white = white.crop(alpha.point(lambda a: 255 if a else 0).getbbox())
    side = round(max(white.size) / 0.92)
    canvas = Image.new("RGBA", (side, side), (255, 255, 255, 0))
    canvas.paste(white, ((side - white.width) // 2, (side - white.height) // 2), white)
    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.resize((128, 128), Image.LANCZOS).save(out, "WEBP", quality=90, method=6)


for p in sorted((SRC / "charges").glob("charge-*.png")):
    charge(p, OUT / f"charges/{p.stem}.webp")
