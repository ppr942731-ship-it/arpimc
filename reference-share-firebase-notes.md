# Catatan referensi Firebase — MC Addon Share

Tanggal riset: 2026-11-27

## Sumber yang diperiksa

- Repository/tree: https://github.com/mayachan-fm/Share
- README: https://raw.githubusercontent.com/mayachan-fm/Share/main/README.md
- Autentikasi dan role: https://raw.githubusercontent.com/mayachan-fm/Share/main/auth.js
- API katalog: https://raw.githubusercontent.com/mayachan-fm/Share/main/api/catalog.js
- Panel Owner: https://raw.githubusercontent.com/mayachan-fm/Share/main/owner.html
- Deployment: https://raw.githubusercontent.com/mayachan-fm/Share/main/vercel.json
- Dependency: https://raw.githubusercontent.com/mayachan-fm/Share/main/package.json

## Temuan teknis

1. Frontend memakai Firebase Auth modular SDK dari CDN dan persistence browser-local. User login dengan email/password; username biasa diubah menjadi alamat email internal. Role dibaca dari Realtime Database pada node `roles/{uid}`.
2. Role default adalah `user`; hanya `admin` dan `owner` yang diberi hak istimewa. Jika pembacaan role gagal, implementasi fail-safe menurunkan akses menjadi user biasa.
3. API server memverifikasi Firebase ID token dari header `Authorization: Bearer ...` memakai Firebase Admin SDK. Role dicek ulang di server melalui Realtime Database; role di frontend bukan sumber otorisasi.
4. Katalog masih dibaca dari GitHub API (`data.json`) dan diberi cache server 60 detik. Jadi Firebase Auth tidak otomatis memperbaiki GitHub HTTP 401.
5. Panel Owner dibuat sebagai halaman khusus dengan kartu-kartu terpisah. Aksi pengelolaan memanggil endpoint server memakai ID token Firebase, bukan mengandalkan role dari browser.
6. Konfigurasi Firebase Admin tetap server-side melalui `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, dan `FIREBASE_DATABASE_URL`. Tidak ada private key di frontend.
7. `vercel.json` referensi hanya memiliki rewrite sitemap. Meta OG detail ditangani oleh serverless API berdasarkan User-Agent crawler; ini relevan sebagai pola terpisah dari migrasi login.
8. `package.json` referensi menggunakan `firebase-admin` dan `@vercel/functions`.

## Implikasi untuk ArpiMC

- Migrasi aman tahap pertama: tambahkan Firebase Authentication + role server-side untuk login Owner, tetapi pertahankan GitHub sebagai katalog/backup. Tahap ini memperbaiki mekanisme login namun belum menghilangkan 401 bila endpoint katalog masih memanggil GitHub dengan token invalid.
- Untuk menghilangkan ketergantungan 401 secara permanen: pindahkan sumber data runtime owner/catalog ke Firebase Realtime Database atau Firestore, lalu jadikan GitHub sebagai backup/export sinkronisasi. Ini perubahan lebih besar dan perlu migrasi data, aturan akses, cache, serta pengujian regresi.
- Kode akses kalkulator tetap harus diverifikasi server-side. Firebase login tidak boleh menjadi bypass untuk unlock kalkulator.
- Panel `/panel-owner` yang sekarang sudah terlindungi session cookie dapat dipertahankan selama fase pertama; Firebase ID token dapat dipakai sebagai jalur autentikasi baru hanya setelah endpoint dan UI diuji.

## Rekomendasi urutan kerja

1. Jangan menghapus atau mengubah fitur existing.
2. Tambahkan konfigurasi Firebase Admin dan endpoint verifikasi ID token secara terisolasi.
3. Tambahkan login Firebase Owner sebagai opsi yang berjalan berdampingan dengan session owner lama.
4. Uji route `/panel-owner`, logout/404, kalkulator, dan hak akses tanpa menyentuh data katalog.
5. Setelah stabil, baru putuskan apakah katalog runtime dipindah ke Firebase atau token GitHub production diperbarui.

Tidak ada secret, token, password, hash, private key, atau kode akses yang disimpan dalam catatan ini.
