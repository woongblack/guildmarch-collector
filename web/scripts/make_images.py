"""Link preview images and territory region maps, made from the site's own art.

Writes, under public/:
  og/default-{lang}.jpg              site preview per language
  og/{lang}/tiers/{slug}.jpg         one per guild tier
  og/{lang}/badges/{id}.jpg          one per weekly badge and season title
  og/{lang}/answers/{slug}.jpg       one per Q&A article
  og/{lang}/glossary/{slug}.jpg      one per glossary term
  og/{lang}/insights/{slug}.jpg      one per data report and guide
  og/{lang}/map/{slug}.jpg           one per terrain region
  images/territory/regions/{slug}.webp   region highlighted on the map, for the region pages

Rerun after changing tier, badge, article, term or region names. The words come from the site code
through scripts/og-text.ts, so nothing is typed twice. Fonts are not in the repo (both are SIL OFL):
  --pretendard  folder with Pretendard-Bold.otf, -SemiBold.otf and -Regular.otf (Korean and English)
  --font-zh     Noto Sans TC variable font, from github.com/google/fonts (ofl/notosanstc)

Run from web/:  python3 scripts/make_images.py --pretendard DIR --font-zh PATH
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
GOLD = (255, 210, 74)
TRIM = (138, 109, 53)
TRIM_BRIGHT = (208, 169, 79)
TEXT = (255, 243, 196)
DIM = (184, 171, 146)
NAVY = (11, 16, 38)
DOMAIN = "guildmarch.com"

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SOURCES = ROOT / "image-sources"

TIER_FILES = ["01-banner-bearer-1", "02-banner-bearer-2", "03-vanguard-1", "04-vanguard-2", "05-breaker-1",
              "06-breaker-2", "07-banner-captain", "08-castellan", "09-overlord"]
AWARD_FILES = {"season-leader": "01-immortal-champion", "continent-ruler": "02-battlefield-sovereign",
               "unbroken-hold": "03-unbroken-guardians", "comeback": "04-comeback"}


class Fonts:
    def __init__(self, pretendard: str, zh: str):
        self.pretendard, self.zh = Path(pretendard), zh
        self.cache = {}

    def get(self, lang: str, size: int, weight: str = "Bold"):
        key = (lang, size, weight)
        if key not in self.cache:
            if lang == "zh-tw":
                f = ImageFont.truetype(self.zh, size)
                f.set_variation_by_name(weight)
            else:
                f = ImageFont.truetype(str(self.pretendard / f"Pretendard-{weight}.otf"), size)
            self.cache[key] = f
        return self.cache[key]


def tokens(lang: str, text: str):
    # Chinese breaks between any two characters, Korean and English between words
    if lang == "zh-tw":
        return re.findall(r"[A-Za-z0-9:.,%'()\-]+|\s+|.", text)
    return re.findall(r"\S+|\s+", text)


def wrap(lang, text, font, width, max_lines):
    lines, line = [], ""
    for tok in tokens(lang, text):
        trial = line + tok
        if font.getlength(trial.strip()) <= width or not line.strip():
            line = trial
            continue
        lines.append(line.strip())
        line = tok.lstrip()
    if line.strip():
        lines.append(line.strip())
    # No lone character on the last line of Chinese text: pull one more down from the line above
    if lang == "zh-tw" and len(lines) > 1 and len(lines[-1]) == 1:
        lines[-2], lines[-1] = lines[-2][:-1], lines[-2][-1] + lines[-1]
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        last = lines[-1]
        while font.getlength(last + "…") > width and last:
            last = last[:-1]
        lines[-1] = last.rstrip() + "…"
    return lines


def cover(im: Image.Image, w: int, h: int) -> Image.Image:
    scale = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def backdrop(scene: str) -> Image.Image:
    # The page's battle scene, blurred and darkened so text reads and the file stays small
    im = cover(Image.open(PUBLIC / "images/scenes" / f"{scene}.webp").convert("RGB"), W, H)
    im = im.filter(ImageFilter.GaussianBlur(6))
    shade = Image.new("RGB", (W, H), NAVY)
    im = Image.blend(im, shade, 0.62)
    # Darker toward the text side
    grad = Image.linear_gradient("L").rotate(90).resize((W, H))
    return Image.composite(shade, im, grad.point(lambda v: v * 0.45))


def frame(draw: ImageDraw.ImageDraw):
    # The site's window frame: a dark edge, then trim and a bright inner line
    draw.rectangle((10, 10, W - 11, H - 11), outline=TRIM, width=4)
    draw.rectangle((18, 18, W - 19, H - 19), outline=TRIM_BRIGHT, width=1)


def subject(path: Path, size: int) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    im.thumbnail((size, size), Image.LANCZOS)
    return im


def card(fonts, lang, scene, kicker, title, sub, image: Path | None, out: Path, title_lines: int | None = None, floor: int = 42):
    im = backdrop(scene)
    draw = ImageDraw.Draw(im)
    frame(draw)
    x = 80
    if image:
        pic = subject(image, 330)
        # A soft glow behind the emblem
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse((60, 140, 440, 520), fill=(255, 210, 74, 46))
        im = Image.alpha_composite(im.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(40))).convert("RGB")
        im.paste(pic, (250 - pic.width // 2, H // 2 - pic.height // 2), pic)
        draw = ImageDraw.Draw(im)
        x = 470
    width = W - 80 - x
    kf = fonts.get(lang, 28, "SemiBold")
    limit = title_lines or (2 if sub else 3)
    size = 68
    while True:
        tf = fonts.get(lang, size, "Bold")
        # One line over the limit, so a title that doesn't fit yet reads as too long instead of being cut
        lines = wrap(lang, title, tf, width, limit + 1)
        if len(lines) <= limit or size <= floor:
            break
        size -= 4
    lines = wrap(lang, title, tf, width, limit)
    sf = fonts.get(lang, 28, "Regular")
    subs = wrap(lang, sub, sf, width, 3) if sub else []
    # Kicker, title and description as one block, centred in the space above the address
    block = 52 + len(lines) * round(size * 1.25) + (14 + len(subs) * 40 if subs else 0)
    y = max(60, (H - 60 - block) // 2)
    draw.text((x, y), kicker, font=kf, fill=GOLD)
    y += 52
    for line in lines:
        draw.text((x, y), line, font=tf, fill=TEXT)
        y += round(size * 1.25)
    if subs:
        y += 14
        for line in subs:
            draw.text((x, y), line, font=sf, fill=DIM)
            y += 40
    draw.text((x, H - 92), DOMAIN, font=fonts.get(lang, 24, "SemiBold"), fill=DIM)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(out, "JPEG", quality=74, optimize=True, progressive=True)


# Territory: region index per map pixel, from cells.png (cell id + 1 in red and green) and map-cells.json
def region_image() -> Image.Image:
    cells = Image.open(PUBLIC / "images/territory/cells.png").convert("RGB")
    region_of = json.loads((ROOT / "lib/map-cells.json").read_text())["region"]
    data = cells.tobytes()
    out = bytearray(cells.width * cells.height)
    for p in range(len(out)):
        c = (data[p * 3] << 8 | data[p * 3 + 1]) - 1
        out[p] = 0 if c < 0 else region_of[c] + 1
    return Image.frombytes("L", cells.size, bytes(out))


def region_crop(art: Image.Image, regions: Image.Image, r: int, aspect: float, min_w: int):
    mask = regions.point(lambda v: 255 if v == r + 1 else 0)
    ring = mask.filter(ImageFilter.MaxFilter(5))
    ring = Image.composite(ring, Image.new("L", ring.size, 0), mask.point(lambda v: 255 - v))
    dim = Image.blend(art, Image.new("RGB", art.size, NAVY), 0.6)
    lit = Image.composite(art, dim, mask)
    lit.paste(GOLD, mask=ring)
    x0, y0, x1, y1 = mask.getbbox()
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    w = max((x1 - x0) * 2.2, (y1 - y0) * 2.2 * aspect, min_w)
    h = w / aspect
    if h > art.height:
        h, w = art.height, art.height * aspect
    left = min(max(cx - w / 2, 0), art.width - w)
    top = min(max(cy - h / 2, 0), art.height - h)
    return lit.crop((round(left), round(top), round(left + w), round(top + h)))


def region_card(fonts, lang, crop: Image.Image, kicker, title, out: Path):
    im = crop.resize((W, H), Image.LANCZOS)
    shade = Image.new("RGB", (W, H), NAVY)
    grad = Image.linear_gradient("L").resize((W, H)).point(lambda v: max(0, v - 120) * 2)
    im = Image.composite(shade, im, grad)
    draw = ImageDraw.Draw(im)
    frame(draw)
    draw.text((70, H - 200), kicker, font=fonts.get(lang, 28, "SemiBold"), fill=GOLD)
    draw.text((70, H - 160), title, font=fonts.get(lang, 64, "Bold"), fill=TEXT)
    domain_font = fonts.get(lang, 24, "SemiBold")
    draw.text((W - 70 - domain_font.getlength(DOMAIN), H - 70), DOMAIN, font=domain_font, fill=DIM)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "JPEG", quality=74, optimize=True, progressive=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pretendard", required=True)
    ap.add_argument("--font-zh", required=True)
    args = ap.parse_args()
    fonts = Fonts(args.pretendard, args.font_zh)
    words = json.loads(subprocess.run(["node", "scripts/og-text.ts"], cwd=ROOT, check=True, capture_output=True, text=True).stdout)
    logo = SOURCES / "logo/logo-mark.png"
    og = PUBLIC / "og"

    for lang, d in words.items():
        card(fonts, lang, "stone-bridge-clash", "WoW: Forever", d["siteName"], d["tagline"], logo, og / f"default-{lang}.jpg")
        for i, x in enumerate(d["tiers"]):
            card(fonts, lang, "hall-of-banners", f"{d['siteName']} · {d['kickers']['tiers']}", x["name"], x["sub"],
                 SOURCES / f"pvp-ranks/{TIER_FILES[i]}.png", og / lang / "tiers" / f"{x['slug']}.jpg")
        for x in d["badges"]:
            if x["id"] in AWARD_FILES:
                image = SOURCES / f"guild-awards/{AWARD_FILES[x['id']]}.png"
            else:
                image = SOURCES / f"badges/badge-{x['id']}.png"
            card(fonts, lang, "hall-of-banners", f"{d['siteName']} · {d['kickers']['badges']}", x["name"], x["sub"],
                 image, og / lang / "badges" / f"{x['id']}.jpg")
        for x in d["answers"]:
            card(fonts, lang, "crossroads-waystone", f"{d['siteName']} · {d['kickers']['answers']}", x["title"], None,
                 SOURCES / f"glossary/categories/{x['category']}.png", og / lang / "answers" / f"{x['slug']}.jpg")
        for x in d["terms"]:
            card(fonts, lang, "lore-archive-raid", f"{d['siteName']} · {d['kickers']['glossary']}", x["title"], x["sub"],
                 SOURCES / f"glossary/{x['slug']}.png", og / lang / "glossary" / f"{x['slug']}.jpg")
        for x in d["insights"]:
            # Article titles are long: four lines and a smaller floor so none is cut
            card(fonts, lang, "lore-archive-raid", f"{d['siteName']} · {d['kickers']['insights']}", x["title"], None,
                 SOURCES / "glossary/categories/data.png", og / lang / "insights" / f"{x['slug']}.jpg", title_lines=4, floor=40)
        print(f"{lang}: cards done")

    art = Image.open(PUBLIC / "images/territory/azeroth-map.webp").convert("RGB")
    regions = region_image()
    page_dir = PUBLIC / "images/territory/regions"
    page_dir.mkdir(parents=True, exist_ok=True)
    slugs = [x["slug"] for x in words["en"]["regions"]]
    for r, slug in enumerate(slugs):
        region_crop(art, regions, r, 16 / 9, 560).resize((960, 540), Image.LANCZOS).save(page_dir / f"{slug}.webp", "WEBP", quality=78)
        crop = region_crop(art, regions, r, W / H, 620)
        for lang, d in words.items():
            region_card(fonts, lang, crop, f"{d['siteName']} · {d['kickers']['map']}", d["regions"][r]["name"], og / lang / "map" / f"{slug}.jpg")
    print("regions done")


if __name__ == "__main__":
    main()
