// ===== TEMA SWITCHER =====
const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

// Baca tema yang disimpan atau pakai gelap sebagai default
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// ===== TAMPILKAN SKIN =====
fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const grid = document.getElementById('skin-grid');
    document.getElementById('total-skins').textContent = data.length;

    data.forEach(skin => {
      grid.innerHTML += `
        <div class="skin-card">
          <img src="${skin.link_gambar}" alt="${skin.nama}" class="skin-img" loading="lazy">
          <div class="skin-info">
            <h3 class="skin-name">${skin.nama}</h3>
            <p class="skin-desc">${skin.deskripsi}</p>
            <p class="skin-date">📅 Diunggah: ${skin.tanggal_upload}</p>
            <a href="${skin.link_download}" target="_blank" class="btn-download">
              <i class="fa-solid fa-download"></i> Download Skin
            </a>
          </div>
        </div>
      `;
    });
  })
  .catch(err => {
    console.error('Error:', err);
    document.getElementById('skin-grid').innerHTML = '<p style="text-align:center;color:var(--text-secondary);">Gagal memuat data 😢</p>';
  });
