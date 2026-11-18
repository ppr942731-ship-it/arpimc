#!/usr/bin/env python3
"""Generate stable social-preview pages keyed by category + JSON ID."""
import hashlib
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
SITE = 'https://arpimc.zone.id'
SHARE = ROOT / 'share'
MANIFEST = SHARE / '.generated-pages.json'
FALLBACK_IMAGE = 'https://files.catbox.moe/7vkqqk.jpg'


def item_slug(item, kind):
    value = item.get('tag') if kind == 'skin' else item.get('nama')
    value = str(value or item.get('slug') or f'{kind}-{item.get("id")}').strip()
    value = re.sub(r'^SKIN\s*', '', value, flags=re.I)
    value = re.sub(r'\s*\|\s*', '-', value)
    value = re.sub(r'[^a-zA-Z0-9]+', '-', value).strip('-').lower()
    return value or f'{kind}-{item.get("id")}'


def detail_url(item, kind):
    slug = item_slug(item, kind)
    return f'{SITE}/{kind}?{quote(slug)}-id={quote(str(item["id"]))}'


def render(item, kind):
    title = (item.get('tag') if kind == 'skin' else item.get('nama')) or 'Konten ArpiMC Zone'
    desc = item.get('deskripsi') or f'Lihat {title} di ArpiMC Zone.'
    image = item.get('gambar') or item.get('image') or FALLBACK_IMAGE
    target = detail_url(item, kind)
    canonical = f'{SITE}/share/{kind}/{quote(str(item["id"]))}/index.html'
    t, d = html.escape(str(title)), html.escape(str(desc))
    img = html.escape(str(image), quote=True)
    dest = html.escape(target, quote=True)
    can = html.escape(canonical, quote=True)
    return f'''<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t} | ArpiMC Zone</title><meta name="description" content="{d}"><link rel="canonical" href="{can}">
<meta property="og:type" content="website"><meta property="og:site_name" content="ArpiMC Zone"><meta property="og:title" content="{t} | ArpiMC Zone"><meta property="og:description" content="{d}"><meta property="og:image" content="{img}"><meta property="og:image:alt" content="{t}"><meta property="og:url" content="{can}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{t} | ArpiMC Zone"><meta name="twitter:description" content="{d}"><meta name="twitter:image" content="{img}">
<meta http-equiv="refresh" content="8;url={dest}">
<style>*{{box-sizing:border-box}}body{{margin:0;min-height:100vh;background:#f0f7ff;color:#172033;font-family:system-ui,sans-serif;display:grid;place-items:center;padding:22px}}main{{width:min(520px,100%);background:white;border:1px solid #dbeafe;border-radius:20px;overflow:hidden;box-shadow:0 12px 40px #1e40af18}}img{{display:block;width:100%;max-height:420px;object-fit:contain;background:#eaf2ff}}section{{padding:20px}}h1{{font-size:22px;margin:0 0 9px}}p{{color:#64748b;line-height:1.6;margin:0 0 18px}}a{{display:inline-flex;background:#06f;color:white;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:11px}}small{{display:block;color:#94a3b8;margin-top:14px}}</style></head>
<body><main><img src="{img}" alt="{t}"><section><h1>{t}</h1><p>{d}</p><a href="{dest}">Buka di ArpiMC Zone</a><small>Anda akan diarahkan otomatis dalam beberapa detik.</small></section></main></body></html>'''


def load_items(filename, kind):
    data = json.loads((ROOT / filename).read_text(encoding='utf-8'))
    if not isinstance(data, list):
        raise ValueError(f'{filename} harus berisi array JSON')
    found, ids = [], set()
    for item in data:
        if not isinstance(item, dict) or item.get('id') is None:
            raise ValueError(f'Item tanpa ID valid ditemukan di {filename}')
        ident = str(item['id']).strip()
        if not ident:
            raise ValueError(f'ID kosong ditemukan di {filename}')
        if ident in ids:
            raise ValueError(f'ID duplikat {ident} ditemukan di {filename}; proses dihentikan agar file tidak tertimpa')
        ids.add(ident)
        typ = str(item.get('jenis', item.get('tipe', item.get('kategori', 'game')))).lower()
        is_tool = typ in ('tools', 'tool', 'alat')
        if kind == 'game' and is_tool:
            continue
        if kind == 'tools' and not is_tool:
            continue
        found.append(item)
    return found


def main():
    old = []
    if MANIFEST.exists():
        try:
            old = json.loads(MANIFEST.read_text(encoding='utf-8'))
        except (json.JSONDecodeError, OSError):
            raise RuntimeError('Manifest preview rusak. Tidak menghapus file apa pun; periksa share/.generated-pages.json.')
    if not isinstance(old, list):
        raise RuntimeError('Format manifest preview tidak valid; proses dihentikan demi keamanan.')

    desired = {}
    for kind, filename in [('skin', 'skins.json'), ('addon', 'addons.json'), ('game', 'games.json'), ('tools', 'games.json')]:
        for item in load_items(filename, kind):
            rel = (Path('share') / kind / str(item['id']) / 'index.html').as_posix()
            if rel in desired:
                raise ValueError(f'Preview duplikat: {rel}')
            desired[rel] = render(item, kind)

    created = updated = unchanged = 0
    for rel, content in desired.items():
        out = ROOT / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists() and out.read_text(encoding='utf-8') == content:
            unchanged += 1
            continue
        was_existing = out.exists()
        out.write_text(content, encoding='utf-8')
        if was_existing: updated += 1
        else: created += 1

    # Delete only files explicitly recorded by the previous generator manifest.
    removed = 0
    for rel in old:
        if not isinstance(rel, str):
            continue
        p = (ROOT / rel).resolve()
        if SHARE.resolve() not in p.parents or p.name != 'index.html':
            continue
        if rel not in desired and p.is_file():
            p.unlink(); removed += 1
            parent = p.parent
            while parent != SHARE and SHARE in parent.parents:
                try: parent.rmdir()
                except OSError: break
                parent = parent.parent

    paths = sorted(desired)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(paths, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Preview selesai: {created} dibuat, {updated} diperbarui, {unchanged} tidak berubah, {removed} dihapus.')


if __name__ == '__main__':
    main()
