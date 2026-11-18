ArpiMC Zone - Update Kategori (18 November 2026)

Perubahan:
- Skin: Skin Couple, Skin Google, Lain-lain, FAQ Cara Pasang Skin.
- Addon: Horor, Survival, Tutorial, Lain-lain, FAQ Cara Pasang Addon.
- Game: Game Santai, Game Quiz, Lain-lain.
- Tools: Tools, Fun, Lain-lain.
- FAQ kategori menampilkan panduan pemasangan.
- Kategori Game/Tools dibaca dari properti kategori pada games.json.
- Fallback data disinkronkan dengan JSON terbaru.
- Cache Service Worker dinaikkan ke versi kategori-v7.

Catatan migrasi data:
Data skin/addon lama yang tidak cocok dengan kategori baru dipertahankan dan dipetakan ke Lain-lain agar tidak hilang.
Game quiz dipetakan ke Game Quiz; Tic-Tac-Toe dan Puzzle Image ke Game Santai; item lain ke Lain-lain.
Tools lama tetap dipertahankan; Nonton TV dipetakan ke Fun, sedangkan utilitas lain ke Tools.

Deployment:
Upload isi folder ini ke repository utama dan deploy seperti biasa melalui Vercel.
