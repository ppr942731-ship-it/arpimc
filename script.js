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
            <a href="${skin.link_download}" target="_blank" class="btn-download">⬇️ Download Skin</a>
          </div>
        </div>
      `;
    });
  })
  .catch(err => {
    console.error('Error:', err);
    document.getElementById('skin-grid').innerHTML = '<p style="text-align:center;color:#f87171;">Gagal memuat data 😢</p>';
  });
