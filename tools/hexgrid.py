# Usage: python3 tools/hexgrid.py ~/projs/biomas-brasil/data/map.json > hex.json  (output goes into BRAZIL_HEX in v4-scene.js)
# Hex grid of Brazil's continental biomes: hex area ~ Pampa area; each hex takes the majority biome of its samples.
import json, math, re, sys
d = json.load(open(sys.argv[1]))
NAMES = ['Amazônia', 'Cerrado', 'Caatinga', 'Mata Atlântica', 'Pantanal', 'Pampa']
def rings(p):
    out = []
    for sub in re.findall(r'M[^M]*', p):
        pts = [tuple(map(float, m)) for m in re.findall(r'(-?[\d.]+),(-?[\d.]+)', sub)]
        out.append(pts[::4] if len(pts) > 400 else pts)  # thinning is plenty for hex-sized sampling
    return out
POLY = {n: rings(d['paths'][n]) for n in NAMES}
def bbox(rs):
    xs = [x for r in rs for x, _ in r]; ys = [y for r in rs for _, y in r]; return min(xs), min(ys), max(xs), max(ys)
BB = {n: bbox(POLY[n]) for n in NAMES}
def inside(n, x, y):
    a, b, c, e = BB[n]
    if not (a <= x <= c and b <= y <= e): return False
    hit = False
    for r in POLY[n]:
        j = len(r) - 1
        for i in range(len(r)):
            xi, yi = r[i]; xj, yj = r[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: hit = not hit
            j = i
    return hit
def area(rs):
    return sum(abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2 for r in rs)
A_pampa = area(POLY['Pampa'])
R = math.sqrt(A_pampa / (3 * math.sqrt(3) / 2))  # pointy-top hex circumradius
W, H = math.sqrt(3) * R, 1.5 * R
SAMPLES = [(0, 0)] + [(R * .5 * math.cos(a * math.pi / 3 + math.pi / 6), R * .5 * math.sin(a * math.pi / 3 + math.pi / 6)) for a in range(6)] \
        + [(R * .85 * math.cos(a * math.pi / 6), R * .85 * math.sin(a * math.pi / 6)) for a in range(12)]
xs = [x for n in NAMES for r in POLY[n] for x, _ in r]; ys = [y for n in NAMES for r in POLY[n] for _, y in r]
x0, y0, x1, y1 = min(xs), min(ys), max(xs), max(ys)
def grid(ox, oy):
    cells = []
    for row in range(int((y1 - y0) / H) + 3):
        for col in range(int((x1 - x0) / W) + 3):
            cx = x0 - W + ox + col * W + (W / 2 if row % 2 else 0); cy = y0 - H + oy + row * H
            cnt = [0] * len(NAMES)
            for sx, sy in SAMPLES:
                for i, n in enumerate(NAMES):
                    if inside(n, cx + sx, cy + sy): cnt[i] += 1; break
            land = sum(cnt)
            if land: cells.append((col, row, cnt, land))
    return cells
best = None
for fx in range(4):
    for fy in range(4):
        cells = grid(fx * W / 4, fy * H / 4)
        kept = [(c, r, max(range(6), key=lambda i: cnt[i])) for c, r, cnt, land in cells if land >= len(SAMPLES) / 2]
        per = [sum(1 for k in kept if k[2] == i) for i in range(6)]
        score = abs(per[5] - 1) * 10 + (per[4] == 0) * 3 + abs(per[4] - 1)
        if best is None or score < best[0]: best = (score, kept, cells, per)
score, kept, cells, per = best
# guarantee exactly one Pantanal and one Pampa hex: the cell with most samples of that biome
for bi in (4, 5):
    if per[bi] == 0:
        c = max(cells, key=lambda t: t[2][bi])
        kept = [k for k in kept if (k[0], k[1]) != (c[0], c[1])] + [(c[0], c[1], bi)]
per = [sum(1 for k in kept if k[2] == i) for i in range(6)]
print('R', round(R), 'score', score, dict(zip(NAMES, per)), 'total', len(kept), file=sys.stderr)
minr = min(k[1] for k in kept)
if minr % 2: minr -= 1  # keep row parity so odd-row offsets stay right
mc = min(k[0] for k in kept)
out = [[c - mc, r - minr, b] for c, r, b in sorted(kept, key=lambda k: (k[1], k[0]))]
print(json.dumps(out, separators=(',', ':')))
