# ArpiMC Zone

## Pembaruan kategori dan preview share

- Kategori baru ditambahkan tanpa menghapus kategori lama.
- Skin: kategori lama tetap ada, ditambah Skin Couple, Skin Google, dan Lain-lain.
- Addon: kategori lama tetap ada, ditambah Horor dan Survival. FAQ/panduan pemasangan berada di Info.
- Game: ditambah Game Santai, Game Quiz, dan Lain-lain; kategori lama tetap ada.
- Tools: Tools, Fun, dan Lain-lain.
- Halaman Info memiliki tab Tutorial, FAQ, dan About ArpiMC.
- Tombol **Salin Link Preview** tersedia pada kartu konten.
- Tombol Bagikan WhatsApp menggunakan URL preview statis agar crawler dapat membaca Open Graph dari HTML awal.

## Membuat ulang halaman preview setelah mengubah JSON

Setiap kali menambah atau mengubah item di `skins.json`, `addons.json`, atau `games.json`, jalankan:

```bash
python3 generate-previews.py
```

Lalu commit/push perubahan JSON beserta folder `share/` yang dihasilkan ke GitHub. Halaman preview statis berisi Open Graph dan Twitter Card, sehingga WhatsApp dapat membaca judul, deskripsi, dan gambar tanpa menunggu JavaScript.

Generator hanya menghapus file yang tercatat di `share/.generated-pages.json`, bukan menghapus seluruh folder `share`.

## Catatan

- Preview media sosial dapat membutuhkan waktu karena WhatsApp menyimpan cache tautan.
- Untuk menguji tampilan terbaru, gunakan URL preview yang belum pernah dibagikan atau layanan debugger/cache refresh platform jika tersedia.
- Perubahan ini tidak melakukan deployment ke Vercel secara otomatis.
