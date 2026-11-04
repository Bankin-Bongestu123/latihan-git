# Panduan Cabang Rilis dan Backport

## 1. Struktur Branch

- `main`: berisi pengembangan fitur dan perbaikan terbaru.
- `release/1.2`: cabang khusus untuk pemeliharaan versi 1.2.
- `fix/*`: cabang untuk mengembangkan perbaikan bug sebelum digabungkan ke `main`.

Branch `release/1.2` dibuat berdasarkan tag `v1.2.0`.

## 2. Proses Backport

Backport dilakukan untuk membawa perbaikan bug penting dari `main` ke branch release tanpa membawa fitur baru yang belum siap dirilis.

Langkah backport:

1. Pastikan bug fix sudah di-merge ke `main`.
2. Pindah ke branch release yang dituju.
3. Jalankan `git cherry-pick -x <commit-hash>`.
4. Selesaikan konflik jika terjadi.
5. Jalankan test untuk memastikan perbaikan tetap berfungsi.
6. Bandingkan commit asli dan hasil backport menggunakan `git range-diff`.

## 3. Kapan Backport Dilakukan?

Backport dilakukan jika:
- Bug berdampak pada pengguna versi release yang masih didukung.
- Perbaikan bersifat kecil, terukur, dan tidak membutuhkan fitur baru.
- Perbaikan dapat diuji tanpa mengubah perilaku lain secara tidak terduga.
- Ada kebutuhan mendesak untuk menjaga stabilitas versi release.

Backport tidak dilakukan jika:
- Perubahan hanya berupa fitur baru yang belum siap dirilis.
- Perbaikan membutuhkan perubahan besar atau refactoring berisiko.
- Perubahan tidak relevan dengan versi release.
- Perubahan memiliki dependensi pada fitur yang belum tersedia di branch release.

## 4. Catatan Backport v1.2.1

- Tag dasar: `v1.2.0`
- Branch release: `release/1.2`
- Commit bug fix di `main`: `a6d7376`
- Commit hasil cherry-pick: `40f6f97`
- Perintah: `git cherry-pick -x a6d7376`
- Hasil pengujian branch release: 167 test berhasil, 0 gagal.

## 5. Hasil Git Range-Diff

Perbandingan commit asli dan backport:

```text
git range-diff a6d7376^..a6d7376 40f6f97^..40f6f97

1: a6d7376 ! 1: 40f6f97 fix: bersihkan file sementara saat penulisan gagal
```

Kedua commit memiliki perubahan bug fix yang sama. Perbedaan metadata mencakup catatan sumber cherry-pick (`-x`).

## 6. Kebijakan Tag Release

Tag release menggunakan annotated tag agar memiliki informasi versi dan pesan release.

Contoh:

```bash
git tag -a v1.2.1 -m "Release v1.2.1"
```

Tag dibuat setelah perubahan release selesai diperiksa dan seluruh pengujian berhasil.

## 7. Bukti Riwayat Branch

### Bug fix di main

```bash
git branch --contains a6d7376
```

Commit asli berada di `main` dan branch pengembangan bug fix.

### Bug fix hasil backport

```bash
git branch --contains 40f6f97
```

Commit hasil cherry-pick berada di `release/1.2`.

### Fitur baru hanya di main

```bash
git branch --contains c61f2fb --list main release/1.2
```

Hasil:

```text
main
```

Fitur sinkronisasi tiga arah hanya terdapat di `main` dan tidak ikut dibawa ke `release/1.2`.