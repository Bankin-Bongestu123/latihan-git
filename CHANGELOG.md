# Changelog

## v1.1.0 - 2026-10-30

### Daftar perubahan

- #44 refactor: pecah cli/hobi.js menjadi modul per perintah (A1)
- #46 fix: lacak regresi dengan git bisect (A2)
- #48 feat: perintah batal (undo) dengan riwayat perubahan (A3)
- #51 feat: penyimpanan v2 (data.json) dan perintah migrasi (A4)
- #42 chore: git hook pre-commit dan CI multi-platform (A5)
- #53 docs: simulasi bencana dan pemulihan dengan reflog (A6)

## v1.0.0 - 2026-10-26

Rilis pertama aplikasi CLI pengelola hobi.

### Daftar perubahan

- #1 feat: tambah profil
- #2 Tambah file hobi
- #4 feat: tambah option
- #6 fix: daftar hobi di hobi.txt tidak lengkap dan formatnya tidak konsisten
- #8 feat: tambah file kontak.txt dan link ke README
- #10 feat: buat skrip PowerShell untuk menghitung ringkasan daftar hobi
- #12 feat: CLI Node.js untuk mengelola daftar hobi (tambah, hapus, cari) dengan tes otomatis dan CI
- #15 fix: CLI hobi menyimpan data tidak aman dan perlu fitur urut + ekspor JSON
- #17 feat: tambah perintah "statistik" dan "impor" di CLI hobi, serta lindungi main dengan aturan branch
- #19 feat: tambah perintah hapus semua hobi dengan konfirmasi
- #21 feat: tambah fitur edit hobi dan pencarian lanjutan
- #23 feat: tambah fitur kategori hobi
- #25 feat: hapus kategori dari hobi
- #26 feat: tampilkan semua kategori beserta jumlah hobi
- #27 feat: tambah tingkat minat (1–5) pada hobi
- #28 feat: ekspor hobi ke file JSON