# Melacak regresi dengan git bisect

## Gejala

Memberi kategori dengan nama hobi yang huruf besar-kecilnya berbeda (misalnya `nGoDiNg`) gagal dengan pesan "Hobi tidak ditemukan".

## Langkah

```
git bisect start
git bisect bad HEAD
git bisect good HEAD~10
git bisect run powershell -NoProfile -ExecutionPolicy Bypass -File skrip/cek.ps1
git bisect reset
```

## Hasil

- Commit penyebab: `0a4b606`, pesan "refactor: sederhanakan pencocokan nama hobi".
- Penyebab: pencocokan nama di `cariNamaHobi` tidak lagi mengabaikan huruf besar dan kecil, sehingga hanya cocok jika hurufnya persis sama.
- Jumlah langkah: 5 pengujian dari 10 commit kandidat.
- Perbaikan: `git revert 0a4b606` di branch latihan.
- Pencegahan: `cli/bantu.test.js` menguji `cariNamaHobi` secara langsung.

## Catatan

- Skrip pengecek keluar dengan kode 0 untuk kondisi baik dan 1 untuk rusak. Kode 125 dipakai untuk melewati commit yang tidak bisa diuji.
- Hook pre-commit dimatikan sementara di branch latihan karena commit yang sengaja memuat bug akan ditolak, lalu diaktifkan kembali setelah latihan.
- Branch latihan tidak di-merge ke `main`.