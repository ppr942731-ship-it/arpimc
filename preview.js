// Metadata dinamis untuk browser pada halaman detail.
// Untuk WhatsApp/social crawler, gunakan halaman statis /share/.../ yang dibuat oleh generate-previews.py.
(async function previewLogicLu(){
  try {
    const path = location.pathname;
    const params = new URLSearchParams(location.search);
    const entry = [...params.entries()].find(([key, value]) => /-id$/.test(key) && /^\d+$/.test(value));
    if (!entry) return;
    const [key, id] = entry;
    const file = path.startsWith('/addon') ? 'addons.json' :
                 (path.startsWith('/game') || path.startsWith('/tools')) ? 'games.json' : 'skins.json';
    const response = await fetch('/' + file, {cache:'no-store'});
    if (!response.ok) return;
    const list = await response.json();
    const item = Array.isArray(list) ? list.find(x => String(x.id) === String(id)) : null;
    if (!item) return;
    const title = (item.tag || item.nama || 'Konten') + ' | ArpiMC Zone';
    const description = item.deskripsi || 'Lihat konten di ArpiMC Zone.';
    document.title = title;
    const setMeta = (selector, value, attr='content') => {
      const node = document.querySelector(selector);
      if (node && value) node.setAttribute(attr, value);
    };
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', item.gambar || '');
    setMeta('meta[property="og:url"]', location.href);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', item.gambar || '');
  } catch (error) {
    console.warn('[ArpiMC preview] Metadata dinamis dilewati:', error);
  }
})();
