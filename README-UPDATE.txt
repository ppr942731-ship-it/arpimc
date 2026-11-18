ArpiMC Zone - Update dan Social Preview Otomatis

1. Tambahkan atau ubah data di skins.json, addons.json, atau games.json.
2. Push perubahan JSON ke branch main.
3. GitHub Actions menjalankan generate-previews.py secara otomatis.
4. Generator memakai identitas kategori + ID: share/skin/ID/, share/addon/ID/, share/game/ID/, dan share/tools/ID/.
5. Jika ID belum ada, halaman dibuat. Jika isi berubah, halaman yang sama diperbarui. Jika tidak berubah, file dilewati. ID duplikat dalam satu kategori sumber akan menghentikan proses dengan pesan error agar data tidak saling menimpa.
6. Halaman preview lama yang dikelola manifest dibersihkan jika item dihapus dari JSON. File lain yang tidak tercatat dalam manifest tidak disentuh.
7. GitHub Actions meng-commit hasil generator. Commit tersebut memicu deployment Vercel.

Info:
- URL preview sosial: https://arpimc.zone.id/share/KATEGORI/ID/
- Vercel rewrites mengarahkan URL tersebut ke index.html.
- File JSON dimuat dari root domain agar halaman /info/ tidak mencoba mengambil /info/data.json.
- Platform sosial dapat menyimpan cache metadata lama walaupun halaman sudah diperbarui.
- GitHub Actions perlu izin repository untuk menulis Contents. Jika workflow tidak dapat push, periksa Settings > Actions > General > Workflow permissions dan pilih Read and write permissions.
