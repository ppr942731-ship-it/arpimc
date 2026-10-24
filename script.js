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

  filtered.forEach((skin, index) => {
    list.innerHTML += `
      <div class="card" data-cat="${skin.kategori}">
        <span class="tag">${skin.tag}</span>
        <img loading="lazy" src="${skin.gambar}" alt="${skin.tag}">
        <div class="card-buttons">
          <button class="btn btn-preview" data-img="${skin.gambar}" data-tag="${skin.tag}">👁 PREVIEW</button>
          <a href="${skin.link_download}" target="_blank" class="btn">⬇️ DOWNLOAD</a>
        </div>
      </div>
    `;
  });

  // Pasang event listener tombol preview
  document.querySelectorAll('.btn-preview').forEach(btn => {
    btn.addEventListener('click', () => {
      openModal(btn.dataset.img, btn.dataset.tag);
    });
  });
}

// ===== MODAL PREVIEW =====
const modal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

function openModal(imgSrc, title) {
  modalTitle.textContent = title;
  modalImage.src = imgSrc;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Tutup modal
modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = '';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

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
