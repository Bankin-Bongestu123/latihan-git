# latihan-git

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
| `node cli/hobi.js ekspor` | Menampilkan daftar hobi dalam format JSON |
| `node cli/hobi.js statistik` | Menampilkan total dan jumlah hobi unik |
| `node cli/hobi.js impor data-uji/impor.json` | Menggabungkan hobi dari file JSON |


### Kategori Hobi

Memberikan kategori pada hobi yang sudah terdaftar:

```bash
node cli/hobi.js kategori "Ngoding" "Teknologi"
```

Menampilkan semua hobi berdasarkan kategori:

```bash
node cli/hobi.js daftar-kategori "Teknologi"
```

Nama hobi dan kategori dicocokkan tanpa membedakan huruf besar dan kecil. Data kategori disimpan secara terpisah di `kategori.json`.

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

Kategori diurutkan alfabetis tanpa membedakan huruf besar dan kecil. Hobi yang belum punya kategori dikelompokkan sebagai berikut "Tanpa Kategori".

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

## Pengujian

Jalankan semua tes dengan:

```powershell
npm test
```

Tes dijalankan otomatis melalui GitHub Actions pada pull request menuju branch `main`.

## Format penyimpanan

File `hobi.txt` menyimpan judul pada baris pertama. Setiap hobi ditulis pada baris berikutnya dengan awalan `- `.

## Skrip ringkasan hobi

Jalankan skrip PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File skrip/ringkasan.ps1
powershell -ExecutionPolicy Bypass -File skrip/ringkasan.ps1 -Path data-uji/hobi-banyak.txt
```
