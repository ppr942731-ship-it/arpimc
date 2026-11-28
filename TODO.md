# TODO — Fase 1 Firebase Authentication

- [x] Firebase Authentication tersedia sebagai opsi login owner di panel setelah kalkulator unlock, tanpa menghapus login username/password existing.
- [x] Firebase Web config project `arpimc-zone` dan provider Google tersedia sebagai opsi login owner.
- [x] Akun guest/anonymous ditolak dari session owner.
- [x] Endpoint konfigurasi Firebase hanya mengembalikan nilai Web Firebase yang bersifat publik dan mengembalikan status nonaktif jika belum dikonfigurasi.
- [x] Endpoint login Firebase memverifikasi ID token server-side, membatasi identitas ke owner yang dikonfigurasi, lalu memakai session cookie owner existing.
- [x] Route `/panel-owner`, logout/404, kalkulator, batas tiga percobaan, katalog, fallback data, dan GitHub API tidak diubah oleh fase ini.
- [x] Dokumentasi environment tidak memuat secret, token, private key, password, hash, atau kode akses.
- [x] Dependency dan syntax server-side diperiksa sebelum perubahan dikirim ke repository.
- [ ] Isi environment Firebase Production dan buat akun Email/Password owner di Firebase Console.
