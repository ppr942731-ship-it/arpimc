# ArpiMC Zone

ArpiMC Zone adalah website komunitas Minecraft untuk menemukan dan membagikan **skin, addon, maps, game, dan tools** dalam satu laman yang nyaman digunakan dari perangkat mobile.

Website ini menggunakan katalog JSON, halaman detail/share, preview sosial otomatis, serta panel owner server-side untuk mengelola asset melalui GitHub API.

## Fitur utama

### Koleksi dan discovery

- Koleksi Skin, Addon, Game, dan Tools.
- Kategori Maps tersedia di dalam koleksi Addon.
- Pencarian, filter, pengurutan, dan halaman detail.
- Preview gambar atau halaman eksternal untuk game/tools sesuai data asset.
- Link share tetap berada di ArpiMC Zone sehingga halaman preview dan tombol unduh dapat dikendalikan dari website.
- Template share WhatsApp memakai link hasil ArpiMC Zone dan sumber dicantumkan sesuai kebutuhan konten.
- Tampilan responsif untuk mobile dan dukungan PWA.

### Preview sosial

Preview share dibuat otomatis melalui workflow GitHub Actions ketika file katalog berubah. Struktur URL yang digunakan:

```text
https://arpimc.zone.id/share/skin/ID/
https://arpimc.zone.id/share/addon/ID/
https://arpimc.zone.id/share/game/ID/
https://arpimc.zone.id/share/tools/ID/
```

Generator preview memakai identitas kategori dan ID asset. Jika asset berubah, halaman preview yang sama diperbarui. Jika asset dihapus dari katalog, halaman preview yang tercatat di manifest dapat dibersihkan tanpa menghapus file eksternal milik pembuat asset.

Platform sosial dapat menyimpan cache metadata lama. Jika gambar atau judul share belum berubah, gunakan alat refresh cache milik platform terkait.

## Panel owner

Panel owner tidak ditampilkan sebagai menu publik. Untuk membukanya:

1. Klik logo **ArpiMC Zone** tiga kali dengan cepat.
2. Kalkulator bersih akan terbuka. Masukkan kode akses langsung melalui keypad.
3. Jika kode benar, form login owner terbuka otomatis. Kode salah dibatasi maksimal tiga percobaan selama 10 menit.
4. Masukkan username dan password owner pada form login.

Verifikasi kode, password, dan session dilakukan di server melalui endpoint `/api/owner/`. Password tidak disimpan di JavaScript, HTML, README, atau repository. Password production harus disimpan sebagai hash scrypt pada environment variable Vercel.

Panel owner dapat mengelola:

- `skins.json`
- `addons.json`
- `games.json`
- subset Tools yang tersimpan sebagai item bertipe `tools` di `games.json`

Penyimpanan asset dilakukan melalui GitHub API server-side. Token GitHub tidak pernah dikirim ke browser.

## Struktur katalog

File katalog utama berada di root repository:

```text
skins.json
addons.json
games.json
data.json
```

Contoh item katalog:

```json
{
  "id": "skin-contoh-1",
  "nama": "Skin Contoh",
  "jenis": "skin",
  "kategori": "skin",
  "gambar": "https://contoh.com/gambar.png",
  "download": "https://contoh.com/file.png",
  "deskripsi": "Deskripsi singkat asset."
}
```

Field dapat mengikuti struktur data yang sudah digunakan oleh katalog aktif. Jangan mengganti katalog dengan file kosong atau versi lama ketika mengubah frontend.

## Arsitektur project

```text
.
├── index.html              # Shell halaman utama
├── script.js               # Routing, katalog, kartu, dan detail
├── style.css               # Tampilan responsif dan tema
├── preview.js              # Preview konten/detail
├── wa-template.js           # Template share WhatsApp
├── owner-panel.js           # UI kalkulator dan panel owner
├── api/owner/               # Endpoint unlock, login, logout, dan asset
├── api/_owner.js            # Validasi scrypt, cookie, session, dan GitHub API
├── skins.json               # Katalog skin
├── addons.json              # Katalog addon/maps
├── games.json               # Katalog game/tools
├── generate-previews.py    # Generator halaman preview sosial
├── .github/workflows/       # Workflow update preview
├── vercel.json              # Routing deployment
└── sw.js                    # Service worker/cache policy
```

## Environment variable

Environment variable berikut hanya boleh disimpan pada Vercel Production atau secret manager lain, bukan pada frontend dan bukan pada commit repository:

```text
OWNER_USERNAME=arpimc zone
OWNER_CALCULATOR_CODE=2016
OWNER_PASSWORD_HASH=scrypt$generated-salt$generated-hash
OWNER_SESSION_SECRET=long-random-secret
GITHUB_TOKEN=fine-grained-token-with-contents-write
GITHUB_OWNER=ppr942731-ship-it
GITHUB_REPO=arpimc
GITHUB_BRANCH=main
```

Pengaturan kode akses dan sandi owner dilakukan melalui **Vercel Project Settings → Environment Variables** pada scope Production. Nilai sandi disimpan sebagai hash scrypt dan tidak pernah ditulis ke repository. Setelah mengubahnya, lakukan redeploy agar runtime mengambil nilai baru.

Gunakan `.env.example` sebagai daftar nama variable tanpa secret asli. Jangan memasukkan password owner, token GitHub, hash production, atau session secret ke repository.

## Deployment Vercel

1. Hubungkan project Vercel ke repository `ppr942731-ship-it/arpimc`.
2. Tambahkan environment variable server-side pada scope **Production**.
3. Deploy ulang setelah mengubah environment variable agar runtime baru memuat nilainya.
4. Pastikan domain Production mengarah ke deployment yang berstatus **Ready**.
5. Uji endpoint owner secara aman menggunakan browser dengan cookie HTTPS.

Endpoint owner:

```text
POST /api/owner/unlock
POST /api/owner/login
POST /api/owner/logout
GET  /api/owner/assets
PUT  /api/owner/assets
```

## Alur perubahan katalog

```text
Owner panel
    ↓
Validasi server-side
    ↓
GitHub API
    ↓
File JSON di branch main
    ↓
GitHub Actions generate preview
    ↓
Deployment Vercel
    ↓
Katalog dan halaman share ArpiMC Zone
```

## Keamanan

- Jangan menyimpan secret di frontend.
- Jangan menaruh password owner atau token GitHub dalam JSON asset.
- Gunakan token GitHub fine-grained dengan izin Contents yang secukupnya.
- Perubahan asset harus melewati endpoint server-side owner.
- Jangan menghapus atau menimpa katalog aktif dengan backup lama tanpa pemeriksaan isi.
- File eksternal tidak dihapus ketika entry katalog dihapus.

## Lisensi dan kontribusi

Hak cipta kode dan konten mengikuti ketentuan pemilik repository. Kontribusi atau perubahan besar harus mempertahankan fitur katalog, routing share, keamanan endpoint owner, dan kompatibilitas mobile.
