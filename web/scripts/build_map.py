"""Splits the territory map's land into about 2,000 cells and 38 terrain regions (R-21).

Run once whenever the map image changes, from web/:
    python3 scripts/build_map.py

Writes
- public/images/territory/cells.png: cell id per pixel, id + 1 in red (high byte) and green (low byte), 0 = sea
- public/images/territory/azeroth-map.webp: the map itself, for the page
- lib/map-cells.json: neighbours, centres, sizes and regions of every cell
Only PIL is needed. Same seeds give the same cells, so cell ids stay stable between runs.
"""
import collections, colorsys, heapq, json, math, pathlib, random, subprocess
from PIL import Image, ImageFilter

WEB = pathlib.Path(__file__).resolve().parent.parent
SRC = WEB / "image-sources/territory-map/azeroth-fanart-map.png"
OUT_IMG = WEB / "public/images/territory"
CELLS, REGIONS = 2000, 38
CELL_SEED = 11
# How much position counts against colour when cells merge into regions; higher gives rounder regions
SPACE_WEIGHT = 0.05
MIN_REGION = 15


def land_mask(img):
    """Sea is the map's navy and teal; everything else is land. Specks are smoothed away."""
    def sea(r, g, b):
        h, s, _ = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        return 165 / 360 <= h <= 250 / 360 and s > 0.12
    w, h = img.size
    small = img.resize((w // 2, h // 2), Image.LANCZOS)
    px = small.load()
    m = Image.new("L", small.size)
    m.putdata([0 if sea(*px[x, y]) else 255 for y in range(small.size[1]) for x in range(small.size[0])])
    m = m.filter(ImageFilter.MedianFilter(7)).resize((w, h), Image.BILINEAR)
    mp = m.load()
    return [[mp[x, y] > 127 for x in range(w)] for y in range(h)]


def seeds_on_land(land, area, target, seed):
    """Jittered grid points that fall on land, spaced for about `target` cells."""
    h, w = len(land), len(land[0])
    random.seed(seed)
    step = (area / target) ** 0.5
    pts, gy = [], 0.0
    while gy < h:
        gx = 0.0
        while gx < w:
            x, y = int(gx + random.random() * step), int(gy + random.random() * step)
            if 0 <= x < w and 0 <= y < h and land[y][x]:
                pts.append((x, y))
            gx += step
        gy += step
    return pts, step


def nearest(pts, step):
    buckets = collections.defaultdict(list)
    for i, (x, y) in enumerate(pts):
        buckets[(int(x // step), int(y // step))].append(i)

    def find(x, y):
        bx, by = int(x // step), int(y // step)
        best, bd = -1, float("inf")
        for dy in (-2, -1, 0, 1, 2):
            for dx in (-2, -1, 0, 1, 2):
                for i in buckets.get((bx + dx, by + dy), ()):
                    d = (pts[i][0] - x) ** 2 + (pts[i][1] - y) ** 2
                    if d < bd:
                        bd, best = d, i
        return best
    return find


def lab(r, g, b):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(r), lin(g), lin(b)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return 116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))


def terrain_regions(img, own, adj, centre):
    """Merges neighbouring cells with the most similar terrain colour and position (Ward linkage),
    so regions follow forests, deserts, mountains and so on. Each continent merges on its own."""
    n = len(adj)
    blurred = img.filter(ImageFilter.GaussianBlur(4)).load()
    acc = [[0.0, 0.0, 0.0, 0] for _ in range(n)]
    for y in range(0, len(own), 2):
        for x in range(0, len(own[0]), 2):
            c = own[y][x]
            if c >= 0:
                L, A, B = lab(*blurred[x, y])
                a = acc[c]
                a[0] += L; a[1] += A; a[2] += B; a[3] += 1
    mean = [[a[0] / a[3], a[1] / a[3], a[2] / a[3], centre[i][0] * SPACE_WEIGHT, centre[i][1] * SPACE_WEIGHT]
            for i, a in enumerate(acc)]
    links = [set(a) for a in adj]
    # Small islands join the nearest big landmass so they can merge; the two continents stay apart
    comp, k = [-1] * n, 0
    for s in range(n):
        if comp[s] < 0:
            stack, comp[s] = [s], k
            while stack:
                for v in adj[stack.pop()]:
                    if comp[v] < 0:
                        comp[v] = k
                        stack.append(v)
            k += 1
    sizes = collections.Counter(comp)
    for c, sz in sizes.items():
        if sz > 150:
            continue
        _, i, j = min((math.dist(centre[i], centre[j]), i, j) for i in range(n) if comp[i] == c
                      for j in range(n) if sizes[comp[j]] > 150)
        links[i].add(j)
        links[j].add(i)

    size, alive, parent, ver = [1] * n, [True] * n, list(range(n)), [0] * n
    def cost(a, b):
        return size[a] * size[b] / (size[a] + size[b]) * sum((p - q) ** 2 for p, q in zip(mean[a], mean[b]))
    heap = [(cost(a, b), a, b, 0, 0) for a in range(n) for b in links[a] if a < b]
    heapq.heapify(heap)
    def merge(a, b):
        total = size[a] + size[b]
        mean[a] = [(p * size[a] + q * size[b]) / total for p, q in zip(mean[a], mean[b])]
        size[a], alive[b], parent[b] = total, False, a
        ver[a] += 1
        links[a] |= links[b]
        links[a] -= {a, b}
        for v in links[b]:
            links[v].discard(b)
            if v != a:
                links[v].add(a)
        for v in links[a]:
            lo, hi = min(a, v), max(a, v)
            heapq.heappush(heap, (cost(lo, hi), lo, hi, ver[lo], ver[hi]))
    count = n
    while count > REGIONS and heap:
        _, a, b, va, vb = heapq.heappop(heap)
        if alive[a] and alive[b] and va == ver[a] and vb == ver[b]:
            merge(a, b)
            count -= 1
    # Too-small regions join their most similar neighbour
    while True:
        small = [r for r in range(n) if alive[r] and size[r] < MIN_REGION and links[r]]
        if not small:
            break
        r = min(small, key=lambda x: size[x])
        merge(min(links[r], key=lambda v: cost(r, v)), r)
    def root(i):
        while parent[i] != i:
            i = parent[i]
        return i
    roots = sorted({root(i) for i in range(n)}, key=lambda r: (centre[r][1], centre[r][0]))
    index = {r: i for i, r in enumerate(roots)}
    return [index[root(i)] for i in range(n)]


def main():
    img = Image.open(SRC).convert("RGB")
    w, h = img.size
    land = land_mask(img)
    area = sum(map(sum, land))
    pts, step = seeds_on_land(land, area, CELLS, CELL_SEED)
    find = nearest(pts, step)
    raw = [[find(x, y) if land[y][x] else -1 for x in range(w)] for y in range(h)]

    # Number cells in reading order of their seeds, keeping only those that own pixels
    used = sorted({c for row in raw for c in row if c >= 0}, key=lambda c: (pts[c][1], pts[c][0]))
    renum = {c: i for i, c in enumerate(used)}
    own = [[renum[c] if c >= 0 else -1 for c in row] for row in raw]
    n = len(used)

    adj = [set() for _ in range(n)]
    sx, sy, size = [0] * n, [0] * n, [0] * n
    for y in range(h):
        row, below = own[y], own[y + 1] if y + 1 < h else None
        for x in range(w):
            a = row[x]
            if a < 0:
                continue
            sx[a] += x
            sy[a] += y
            size[a] += 1
            for b in (row[x + 1] if x + 1 < w else -1, below[x] if below else -1):
                if b >= 0 and b != a:
                    adj[a].add(b)
                    adj[b].add(a)
    centre = [(round(sx[i] / size[i]), round(sy[i] / size[i])) for i in range(n)]

    region = terrain_regions(img, own, adj, centre)
    regions = max(region) + 1

    OUT_IMG.mkdir(parents=True, exist_ok=True)
    ids = Image.new("RGB", (w, h))
    ids.putdata([(((c + 1) >> 8) & 255, (c + 1) & 255, 0) for row in own for c in row])
    ids.save(OUT_IMG / "cells.png", optimize=True)
    subprocess.run(["cwebp", "-quiet", "-q", "80", "-m", "6", str(SRC), "-o", str(OUT_IMG / "azeroth-map.webp")], check=True)
    meta = {
        "width": w, "height": h, "cells": n, "regions": regions,
        "neighbours": [sorted(a) for a in adj], "centre": centre, "size": size, "region": region,
    }
    (WEB / "lib/map-cells.json").write_text(json.dumps(meta, separators=(",", ":")))
    lonely = sum(1 for a in adj if not a)
    per = collections.Counter(region)
    print(f"{n} cells, {regions} regions of {min(per.values())}-{max(per.values())} cells, {area / (w * h):.1%} land, "
          f"{sum(map(len, adj)) / n:.1f} neighbours on average, {lonely} without neighbours")


if __name__ == "__main__":
    main()
