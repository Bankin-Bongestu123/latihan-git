# Simulasi Bencana dan Pemulihan Git dengan Reflog

## Tujuan

Melatih pemulihan pekerjaan Git yang terlihat hilang akibat kesalahan seperti `git reset --hard` dan penghapusan branch.

Seluruh simulasi dilakukan di klon terpisah `latihan-pemulihan`, bukan repository utama.

## 1. Pemulihan Tiga Commit dengan Reflog

### Simulasi

Membuat tiga commit:

```bash
git commit -m "test: simulasi commit pertama"
git commit -m "test: simulasi commit kedua"
git commit -m "test: simulasi commit ketiga"
```

Menghilangkan tiga commit:

```bash
git reset --hard HEAD~3
```

### Pemeriksaan

```bash
git reflog
```

Output yang ditemukan:

```text
2194a5c HEAD@{1}: commit: test: simulasi commit ketiga
ba6542d HEAD@{2}: commit: test: simulasi commit kedua
febc0aa HEAD@{3}: commit: test: simulasi commit pertama
```

### Pemulihan

```bash
git reset --hard "HEAD@{1}"
```

Verifikasi:

```bash
git log --oneline -4
Get-Content simulasi.txt
```

Hasil: ketiga commit berhasil dipulihkan beserta isi file `simulasi.txt`.

## 2. Pemulihan Branch yang Dihapus

### Simulasi

Membuat branch dan commit:

```bash
git switch -c fitur-belum-merge
git add fitur-hilang.txt
git commit -m "test: simulasi branch belum merge"
```

Menghapus branch:

```bash
git switch main
git branch -D fitur-belum-merge
```

Commit yang dihapus bersama referensi branch:

```text
7a7cbf2 test: simulasi branch belum merge
```

### Pemeriksaan dan Pemulihan

```bash
git reflog --all
git branch fitur-belum-merge 7a7cbf2
git switch fitur-belum-merge
```

Verifikasi:

```bash
git log --oneline -3
Get-Content fitur-hilang.txt
```

Hasil: branch dan pekerjaan berhasil dipulihkan menggunakan hash commit yang ditemukan melalui reflog.

## 3. Pemulihan Commit Tanpa Referensi dengan Git FSCK

### Simulasi

Membuat commit pada branch `latihan-fsck`, kemudian menghapus branch tersebut setelah berpindah ke `main`.

```bash
git switch -c latihan-fsck
git add fsck-hilang.txt
git commit -m "test: simulasi commit tanpa referensi"
git switch main
git branch -D latihan-fsck
```

### Pemeriksaan

```bash
git fsck --lost-found
```

Output:

```text
dangling commit 0a942b159960849a9435f1a0ccc9df9559cc3db5
```

### Pemulihan

```bash
git branch pemulihan-fsck 0a942b159960849a9435f1a0ccc9df9559cc3db5
git switch pemulihan-fsck
```

Verifikasi:

```bash
git log --oneline -3
Get-Content fsck-hilang.txt
```

Hasil: commit tanpa referensi berhasil ditemukan dan dipulihkan menjadi branch baru.

## 4. Perbedaan Reset, Restore, dan Revert

| Perintah | Fungsi |
|---|---|
| `git reset` | Memindahkan posisi HEAD atau branch ke commit lain. Dapat mengubah staging area dan working tree, bergantung pada opsi yang digunakan. |
| `git restore` | Memulihkan isi file di working tree atau staging area. |
| `git revert` | Membuat commit baru yang membatalkan perubahan dari commit sebelumnya. |

### Contoh Penggunaan

```bash
git reset --hard HEAD~1
git restore nama-file.txt
git revert <commit-hash>
```

## 5. Kesimpulan

Latihan menunjukkan bahwa pekerjaan Git yang terlihat hilang masih dapat dipulihkan dalam kondisi tertentu:

- `git reflog` membantu menemukan riwayat perpindahan HEAD dan commit sebelumnya.
- Hash commit dapat digunakan untuk membuat kembali branch yang telah dihapus.
- `git fsck --lost-found` membantu menemukan objek commit yang tidak lagi memiliki referensi.

Pemulihan tidak selalu dijamin, terutama jika objek Git sudah dibersihkan oleh garbage collection. Karena itu, backup dan kehati-hatian saat menjalankan perintah destruktif tetap diperlukan.