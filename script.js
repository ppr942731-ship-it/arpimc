// === DATA ===
let skins = [];
let addons = [];
let games = [];
let currentSkinFilter = 'all';
let currentAddonFilter = 'all';

// === MUAT SEMUA DATA ===
Promise.all([
  fetch('skins.json').then(r => r.json()),
  fetch('addons.json').then(r => r.json()),
  fetch('games.json').then(r => r.json())
])
.then(([skinData, addonData, gameData]) => {
  skins = skinData;
  addons = addonData;
  games = gameData;
  
  document.getElementById('totalSkin').textContent = skins.length;
  document.getElementById('totalAddon').textContent = addons.length;
  
  renderSkins();
  renderAddons();
  renderGames();
})
.catch(err => console.error('Gagal memuat data:', err));

// === RENDER SKIN ===
function renderSkins() {
  const grid = document.getElementById('skinGrid');
  const filtered = currentSkinFilter === 'all' 
    ? skins 
    : skins.filter(s => s.kategori === currentSkinFilter);
  
  grid.innerHTML = filtered.map(item => `
    <div class="card">
      <img src="${item.gambar}" alt="${item.tag}" class="card-image" loading="lazy">
      <h3 class="card-title">${item.tag}</h3>
      <div class="card-buttons">
        <button class="btn btn-secondary" data-preview="${item.gambar}" data-title="${item.tag}">Preview</button>
        <a href="${item.link_download}" target="_blank" class="btn btn-primary">Unduh</a>
      </div>
    </div>
  `).join('');
  
  attachPreviewEvents();
}

// === RENDER ADDON ===
function renderAddons() {
  const grid = document.getElementById('addonGrid');
  const filtered = currentAddonFilter === 'all' 
    ? addons 
    : addons.filter(a => a.kategori === currentAddonFilter);
  
  grid.innerHTML = filtered.map(item => `
    <div class="card">
      ${item.gambar 
        ? `<img src="${item.gambar}" alt="${item.nama}" class="card-image" loading="lazy">`
        : `<div class="card-image" style="display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--text-alt)">📦</div>`
      }
      <h3 class="card-title">${item.nama}</h3>
      <p class="card-desc">${item.deskripsi || ''}</p>
      ${item.versi_mc ? `<div class="card-meta"><span class="meta-tag">MC: ${item.versi_mc}</span></div>` : ''}
      <div class="card-buttons">
        <a href="${item.link_download || '#'}" target="_blank" class="btn btn-primary" style="width:100%">Unduh</a>
      </div>
    </div>
  `).join('');
}

// === RENDER GAME ===
function renderGames() {
  const grid = document.getElementById('gameGrid');
  grid.innerHTML = games.map(item => `
    <div class="card">
      <div style="font-size:2.5rem;text-align:center;padding:24px 0;">🎮</div>
      <h3 class="card-title" style="text-align:center">${item.nama}</h3>
      <p class="card-desc" style="text-align:center">${item.deskripsi}</p>
      <a href="${item.link}" target="_blank" class="btn btn-primary" style="width:100%">Buka Game</a>
    </div>
  `).join('');
}

// === PREVIEW MODAL ===
const modal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');

function attachPreviewEvents() {
  document.querySelectorAll('[data-preview]').forEach(btn => {
    btn.addEventListener('click', () => {
      modalTitle.textContent = btn.dataset.title;
      modalImage.src = btn.dataset.preview;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
}

modalClose.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  modalImage.src = '';
  modalTitle.textContent = '';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modalClose.click();
  }
});

// === NAVIGASI BAWAH ===
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    const page = item.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${page}Page`).classList.add('active');
  });
});

// === FILTER SKIN ===
document.querySelectorAll('#skinFilters .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#skinFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSkinFilter = btn.dataset.cat;
    renderSkins();
  });
});

// === FILTER ADDON ===
document.querySelectorAll('#addonFilters .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#addonFilters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAddonFilter = btn.dataset.cat;
    renderAddons();
  });
});

// === MENU TEMA ===
const menuToggle = document.getElementById('menuToggle');
const themeMenu = document.getElementById('themeMenu');

menuToggle.addEventListener('click', () => {
  themeMenu.classList.toggle('active');
});

themeMenu.addEventListener('click', (e) => {
  if (e.target === themeMenu) {
    themeMenu.classList.remove('active');
  }
});

document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.dataset.theme;
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
    themeMenu.classList.remove('active');
  });
});

// === MUAT TEMA YANG DISIMPAN ===
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}
