#!/usr/bin/env python3
import json, re, html
from pathlib import Path
from urllib.parse import quote
ROOT=Path(__file__).resolve().parent
SITE='https://arpimc.zone.id'
SHARE=ROOT/'share'
MANIFEST=SHARE/'.generated-pages.json'
def slugify(value):
    value=str(value or '').lower()
    value=re.sub(r'[\\u0300-\\u036f]','',value)
    return re.sub(r'^-|-$','',re.sub(r'[^a-z0-9]+','-',value))
def item_slug(item,kind):
    if kind=='skin':
        value=item.get('slug') or item.get('tag') or item.get('nama') or ''
        value=re.sub(r'^SKIN\\s*','',value,flags=re.I)
        value=re.sub(r'\\s*\\|\\s*','-',value)
        value=re.sub(r'^CR\\s*','cr-',value,flags=re.I)
        value=re.sub(r'-\\d+$','',slugify(value))
        return value or f"skin-{item.get('id')}"
    if kind=='addon' and str(item.get('nama','')).lower()=='mutants': return 'mutans'
    return slugify(item.get('slug') or item.get('nama') or f"{kind}-{item.get('id')}")
def detail_url(item,kind):
    return f"{SITE}/{kind}?{quote(item_slug(item,kind))}-id={item.get('id')}"
def render(item,kind):
    title=(item.get('tag') if kind=='skin' else item.get('nama')) or 'Konten ArpiMC Zone'
    desc=item.get('deskripsi') or f'Lihat {title} di ArpiMC Zone.'
    image=item.get('gambar') or 'https://files.catbox.moe/7vkqqk.jpg'
    target=detail_url(item,kind)
    canonical=f"{SITE}/share/{kind}/{item_slug(item,kind)}-{item.get('id')}/"
    t,d=html.escape(str(title)),html.escape(str(desc))
    img,dest=html.escape(str(image),quote=True),html.escape(target,quote=True)
    can=html.escape(canonical,quote=True)
    return f'''<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t} | ArpiMC Zone</title><meta name="description" content="{d}"><link rel="canonical" href="{can}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ArpiMC Zone">
<meta property="og:title" content="{t} | ArpiMC Zone"><meta property="og:description" content="{d}">
<meta property="og:image" content="{img}"><meta property="og:image:alt" content="{t}"><meta property="og:url" content="{can}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t} | ArpiMC Zone">
<meta name="twitter:description" content="{d}"><meta name="twitter:image" content="{img}">
<meta http-equiv="refresh" content="8;url={dest}">
<style>*{{box-sizing:border-box}}body{{margin:0;min-height:100vh;background:#f0f7ff;color:#172033;font-family:system-ui,sans-serif;display:grid;place-items:center;padding:22px}}main{{width:min(520px,100%);background:white;border:1px solid #dbeafe;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px #1e40af18}}img{{display:block;width:100%;max-height:420px;object-fit:contain;background:#eaf2ff}}section{{padding:20px}}h1{{font-size:22px;margin:0 0 9px}}p{{color:#64748b;line-height:1.6;margin:0 0 18px}}a{{display:inline-flex;background:#06f;color:white;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:11px}}small{{display:block;color:#94a3b8;margin-top:14px}}</style></head>
<body><main><img src="{img}" alt="{t}"><section><h1>{t}</h1><p>{d}</p><a href="{dest}">Buka di ArpiMC Zone</a><small>Anda akan diarahkan otomatis dalam beberapa detik.</small></section></main></body></html>'''
def main():
    old=[]
    if MANIFEST.exists():
        try: old=json.loads(MANIFEST.read_text(encoding='utf-8'))
        except Exception: old=[]
    for rel in old:
        p=ROOT/rel
        if p.is_file() and SHARE in p.parents: p.unlink()
    generated=[]; seen=set()
    for kind,filename in [('skin','skins.json'),('addon','addons.json'),('game','games.json'),('tools','games.json')]:
        rows=json.loads((ROOT/filename).read_text(encoding='utf-8'))
        for item in rows:
            typ=str(item.get('jenis',item.get('tipe','game'))).lower()
            if kind=='game' and typ in ('tools','tool','alat'): continue
            if kind=='tools' and typ not in ('tools','tool','alat'): continue
            rel=(Path('share')/kind/(item_slug(item,kind)+'-'+str(item.get('id')))/'index.html').as_posix()
            if rel in seen: raise ValueError('Slug preview duplikat: '+rel)
            seen.add(rel); out=ROOT/rel; out.parent.mkdir(parents=True,exist_ok=True)
            out.write_text(render(item,kind),encoding='utf-8'); generated.append(rel)
    MANIFEST.parent.mkdir(parents=True,exist_ok=True)
    MANIFEST.write_text(json.dumps(generated,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Berhasil membuat {len(generated)} halaman preview.')
if __name__=='__main__': main()
