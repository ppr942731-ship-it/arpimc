// ===== MUAT DATA DARI data.json =====
let skinData = [];

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    skinData = data;
    document.getElementById('totalSkin').textContent = data.length;
    renderSkins('all');
  })
  .catch(err => console.error('Error memuat data:', err));

// ===== RENDER DAFTAR SKIN =====
function renderSkins(category) {
  const list = document.getElementById('skinList');
  list.innerHTML = '';

  const filtered = category === 'all' 
    ? skinData 
    : skinData.filter(s => s.kategori === category);

  filtered.forEach(skin => {
    list.innerHTML += `
      <div class="card" data-cat="${skin.kategori}">
        <span class="tag">${skin.tag}</span>
        <img loading="lazy" src="${skin.gambar}" alt="${skin.nama}">
        <p style="font-weight:600; margin:8px 0 4px;">${skin.nama}</p>
        <p style="font-size:0.85em; color:var(--muted); margin-bottom:8px;">${skin.deskripsi}</p>
        <p style="font-size:0.8em; color:var(--muted); margin-bottom:12px;">📅 ${skin.tanggal_upload}</p>
        <a href="${skin.link_download}" target="_blank" class="btn">⬇️ DOWNLOAD SKIN</a>
      </div>
    `;
  });
}

// ===== THEME SWITCHER =====
const body = document.body;
const themeBtn = document.getElementById('themeToggle');

if(localStorage.theme === 'dark') body.classList.add('dark');

themeBtn.onclick = () => {
  body.classList.toggle('dark');
  localStorage.theme = body.classList.contains('dark') ? 'dark' : 'light';
};

// ===== FILTER KATEGORI =====
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSkins(btn.dataset.cat);
  };
});

// ===== Q&A ACCORDION =====
document.querySelectorAll('.qa-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    item.classList.toggle('active');
    btn.setAttribute('aria-expanded', item.classList.contains('active'));
  });
});
