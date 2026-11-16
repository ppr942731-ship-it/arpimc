// LOGIC LU, PIN! JANGAN DIHAPUS!
// Contoh URL: /skin?cowok-cr-keyy-id=1

async function previewLogicLu() {
  const path = location.pathname;
  const query = location.search;

  const param = new URLSearchParams(query);
  const key = [...param.keys()][0];
  const id = param.get(key);

  if (!key) return;

  let fileJson = 'skins.json';
  if (path.includes('addon')) fileJson = 'addons.json';
  if (path.includes('game')) fileJson = 'games.json';

  const res = await fetch('/' + fileJson);
  const list = await res.json();

  const item = list.find(x => String(x.id) == String(id));
  if (!item) return;

  document.title = item.nama + ' | ArpiMC Zone';

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');

  if (ogTitle) ogTitle.content = item.nama;
  if (ogDesc) ogDesc.content = item.deskripsi || item.nama + ' — ArpiMC Zone';
  if (ogImage) ogImage.content = item.gambar;
  if (ogUrl) ogUrl.content = location.href;
}
previewLogicLu();
