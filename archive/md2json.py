import re, json, sys, unicodedata
src, out = sys.argv[1], sys.argv[2]
year = month = None; items = []; seen = set()
def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')[:60]
for line in open(src, encoding='utf8'):
    line = line.rstrip('\n')
    m = re.match(r'^## (.+)', line)
    if m:
        h = m.group(1); year = h[:4] if h[:4].isdigit() else 'antes'; month = None if year!='antes' else ''; continue
    m = re.match(r'^### (.+)', line)
    if m: month = m.group(1); continue
    m = re.match(r'^- \*\*(.+?)\*\*(.*)$', line)
    if not m or year is None: continue
    title, rest = m.group(1), m.group(2)
    if title.startswith('['): continue  # legend
    tags = []
    for t,k in [('[BRCHAD]','brchad'),('[Claude','claude'),('[cliente]','cliente'),('[lab]','lab'),('❓','confirmar'),('~data','aprox')]:
        if t in rest: tags.append(k)
    link = ''
    lm = re.search(r'(https?://\S+)\s*$', rest)
    if lm: link = lm.group(1); rest = rest[:lm.start()]
    parts = [p.strip() for p in rest.split(' · ')]
    desc = parts[0]; kind = parts[1] if len(parts) > 1 else ''
    when = ''
    wm = re.match(r'^\s*\(([^)]+)\)', desc)
    if wm: when = wm.group(1); desc = desc[wm.end():]
    for t in ['[BRCHAD]','[Claude]','[Claude?]','[cliente]','[lab]','❓','~data']: desc = desc.replace(t,'')
    desc = re.sub(r'^\s*—\s*','',desc).strip().rstrip('·').strip()
    kind = kind.strip().rstrip('·').strip()
    if link and not link.startswith('https://'): link = ''
    i = slug(title); base = i; n = 2
    while i in seen: i = f'{base}-{n}'; n += 1
    seen.add(i)
    items.append(dict(id=i, y=year, m=month or when, t=title, d=desc, k=kind, tags=tags, url=link))
json.dump(items, open(out,'w',encoding='utf8'), ensure_ascii=False, separators=(',',':'))
print(len(items), sum('brchad' in x['tags'] for x in items), sum('claude' in x['tags'] for x in items))
