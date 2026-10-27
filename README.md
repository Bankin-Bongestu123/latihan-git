# latihan-git
[![Test](https://github.com/Bankin-Bongestu123/latihan-git/actions/workflows/test.yml/badge.svg)](https://github.com/Bankin-Bongestu123/latihan-git/actions/workflows/test.yml)
CLI sederhana untuk mengelola daftar hobi menggunakan Node.js tanpa dependensi eksternal.

## Persiapan

Pastikan Node.js sudah terpasang. Clone repository, kemudian masuk ke direktori proyek.

## Perintah CLI

Jalankan perintah dari direktori utama repository.

| Perintah | Fungsi |
|---|---|
| `node cli/hobi.js daftar` | Menampilkan semua hobi |
| `node cli/hobi.js tambah "Main Gitar"` | Menambahkan hobi baru |
| `node cli/hobi.js hapus "Main Gitar"` | Menghapus hobi |
| `node cli/hobi.js hapus-semua` | Menghapus semua hobi setelah konfirmasi |
| `node cli/hobi.js cari "Main"` | Mencari hobi |
| `node cli/hobi.js urut` | Mengurutkan hobi |
| `node cli/hobi.js statistik` | Menampilkan total dan jumlah hobi unik |
| `node cli/hobi.js impor data-uji/impor.json` | Menggabungkan hobi dari file JSON |
| `node cli/hobi.js edit "Lama" "Baru"` | Mengganti nama hobi |
| `node cli/hobi.js kategori "Ngoding" "Teknologi"` | Memberi kategori pada hobi |
| `node cli/hobi.js hapus-kategori "Ngoding"` | Menghapus kategori dari hobi |
| `node cli/hobi.js daftar-kategori "Teknologi"` | Menampilkan hobi dalam satu kategori |
| `node cli/hobi.js semua-kategori` | Menampilkan semua kategori beserta jumlah hobi |
| `node cli/hobi.js minat "Ngoding" 5` | Memberi tingkat minat 1 sampai 5 |
| `node cli/hobi.js urut-minat` | Mengurutkan hobi dari minat tertinggi |
| `node cli/hobi.js impor data-uji/impor.json` | Menggabungkan hobi dari file JSON |
| `node cli/hobi.js ekspor [file.json] [--paksa]` | Menampilkan hobi sebagai JSON, atau menyimpannya ke file |



### Kategori Hobi

Memberikan kategori pada hobi yang sudah terdaftar:

```bash
node cli/hobi.js kategori "Ngoding" "Teknologi"
```

Menampilkan semua hobi berdasarkan kategori:

```bash
node cli/hobi.js daftar-kategori "Teknologi"
```

Menghapus kategori dari sebuah hobi (hobinya tetap ada):

```bash
node cli/hobi.js hapus-kategori "Ngoding"
```

Nama hobi dan kategori dicocokkan tanpa membedakan huruf besar dan kecil. Data kategori disimpan secara terpisah di `kategori.json`.

### Tingkat minat

```
node cli/hobi.js minat "Ngoding" 5
node cli/hobi.js urut-minat
```

Tingkat minat berupa angka 1 sampai 5. `urut-minat` menampilkan hobi dari minat tertinggi.

### Catatan

Data kategori disimpan di berkas kategori.json.

### Menampilkan semua kategori

```
node cli/hobi.js semua-kategori
```

Contoh output:

```
- Santai: 1 hobi
- Tanpa Kategori: 1 hobi
- Teknologi: 2 hobi
```

Kategori diurutkan alfabetis tanpa membedakan huruf besar dan kecil. Hobi yang belum punya kategori dikelompokkan sebagai "Tanpa Kategori".

## Format file impor

File JSON harus memiliki properti `hobi` berupa array string.

Contoh:

```json
{
  "judul": "Hobi Impor",
  "hobi": ["Membaca", "Memasak"]
}
```

Hobi yang sudah ada tidak akan ditambahkan kembali jika namanya sama tanpa membedakan huruf besar dan kecil. Impor mempertahankan judul yang tersimpan di `hobi.txt`.

## Struktur folder

```
cli/
  hobi.js          router: membaca argumen dan meneruskan ke perintah
  penyimpanan.js   baca dan tulis hobi.txt, kategori.json, minat.json
  logika.js        fungsi murni untuk daftar hobi
  bantu.js         fungsi bantu bersama
  perintah/        satu file per perintah
```

Menambah perintah baru: buat `cli/perintah/<nama>.js` yang mengekspor `jalankan({ judul, hobi, sisa, argumen })`, lalu daftarkan di `PERINTAH` pada `cli/hobi.js`.

## Pengujian

Jalankan semua tes dengan:

```powershell
npm test
```

Tes dijalankan otomatis melalui GitHub Actions pada pull request menuju branch `main`.

## Git hook

Aktifkan hook pre-commit sekali setelah clone:

```
git config core.hooksPath .githooks
```

Hook menjalankan `git diff --cached --check` dan `npm test` sebelum setiap commit. Commit ditolak jika salah satunya gagal.

`git commit --no-verify` melewati hook. Pakai hanya untuk commit sementara di branch pribadi, misalnya menyimpan pekerjaan setengah jadi sebelum pindah komputer. Jangan dipakai untuk commit yang akan di-merge, karena CI tetap akan menolak test yang gagal.

## Cakupan CI

Test berjalan di Ubuntu dan Windows dengan Node 20 dan 22 pada setiap push dan pull request ke `main`.

## Format penyimpanan

File `hobi.txt` menyimpan judul pada baris pertama. Setiap hobi ditulis pada baris berikutnya dengan awalan `- `.

## Skrip ringkasan hobi

Jalankan skrip PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File skrip/ringkasan.ps1
powershell -ExecutionPolicy Bypass -File skrip/ringkasan.ps1 -Path data-uji/hobi-banyak.txt
```
