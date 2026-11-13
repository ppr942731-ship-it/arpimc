ArpiMC Zone - pembaruan fitur kartu, unduh, dan PWA

BASE: ArpiMC-Zone-Final.zip (revisi sebelumnya yang menggunakan data terbaru).

Perubahan:
- Skin card tetap portrait 9:16.
- Addon card landscape 16:9.
- Card skin dan addon memiliki tombol Preview dan Unduh.
- Skin card memiliki tombol Kirim via WhatsApp dengan template yang diberikan.
- Game card tanpa gambar; hanya kategori, nama, deskripsi, dan tombol Mainkan.
- Halaman game menampilkan iframe penuh dengan tombol Kembali dan Buka Tab Baru.
- Kategori Game, Tools, Fun, dan Lain-lain tetap tersedia.
- Tepat dua shortcut PWA: Skin dan Addon, memakai ikon PNG lokal same-origin.
- Tombol Unduh ArpiMC Zone mengambil label/link/mode dari data.json dan memanggil prompt instalasi PWA bila browser mendukungnya.
- Info page dirender langsung dari data.json. Kanal Kemino Skin tidak dimasukkan karena sudah bukan kanal pengguna.
- Canonical tetap https://arpimc.zone.id/ agar identitas URL utama tidak berubah.

Catatan ikon: file PNG lokal adalah ikon badge ArpiMC Zone yang dibundel agar shortcut tidak bergantung pada gambar Catbox eksternal. Header dan OG image tetap menggunakan URL logo Catbox yang diberikan. Jika ingin gambar shortcut sama persis dengan logo Catbox, ganti icons/icon-96.png, icon-192.png, icon-512.png dengan file PNG logo asli berukuran sesuai.

Deploy: unggah isi folder ArpiMC-Zone-Update ke root hosting. HTTPS diperlukan untuk service worker dan PWA. Shortcut PWA muncul sesuai dukungan browser/launcher setelah website dipasang sebagai PWA.
