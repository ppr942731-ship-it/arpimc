# Rencana Fase 1 — Firebase Authentication ArpiMC Zone

## Tujuan

Menambahkan Firebase Authentication sebagai jalur login owner baru, tanpa menghapus login owner lama, kalkulator unlock, session cookie, route `/panel-owner`, katalog GitHub, fallback data, atau alur share.

## Arsitektur

- Browser meminta konfigurasi Firebase Web publik dari `/api/owner/firebase-config`.
- Browser melakukan `signInWithEmailAndPassword` melalui Firebase Authentication SDK.
- Browser mengirim Firebase ID token ke `/api/owner/firebase-login`.
- Server memverifikasi ID token dengan Firebase Admin SDK.
- Server membatasi token ke identitas owner yang diset melalui environment variable `FIREBASE_OWNER_UID` atau `FIREBASE_OWNER_EMAIL`.
- Server membuat session cookie owner existing; seluruh endpoint panel existing tetap memakai session cookie tersebut.
- Login username/password existing tetap tersedia sebagai fallback.

## Perubahan file

- `api/_firebase.js`: helper Firebase Admin dan validasi identitas owner.
- `api/owner/firebase-config.js`: mengirim konfigurasi Web publik tanpa private key.
- `api/owner/firebase-login.js`: verifikasi ID token dan pembuatan session owner existing.
- `owner-panel.js`: tombol login Firebase dengan lazy loading SDK; alur lama dipertahankan.
- `.env.example` dan `README.md`: dokumentasi nama environment tanpa secret.
- `package.json`: dependency server-side `firebase-admin`.

## Batasan fase ini

Firebase hanya menggantikan jalur autentikasi. Katalog masih memakai GitHub API sehingga masalah `GITHUB_TOKEN` HTTP 401 belum dianggap selesai pada fase ini.
