# Penggabungan Tiga Arah (Three-Way Merge)

## 1. Konsep Three-Way Merge

Three-way merge adalah metode penggabungan perubahan dengan membandingkan tiga kondisi:

- **Base:** kondisi awal yang menjadi titik acuan bersama.
- **Local:** perubahan dari sisi lokal.
- **Other:** perubahan dari sisi lain.

Tujuannya adalah menggabungkan perubahan tanpa menghilangkan perubahan yang dibuat oleh masing-masing pihak.

## 2. Praktik git merge-file

Perintah yang digunakan:

```bash
git merge-file -p lokal.txt basis.txt lain.txt
```

Keterangan:
- `lokal.txt`: file versi lokal.
- `basis.txt`: file basis atau kondisi awal.
- `lain.txt`: file dari sisi lain.
- `-p`: menampilkan hasil ke terminal tanpa mengubah file.

Hasil pengujian menunjukkan konflik karena kedua file menambahkan baris berbeda pada posisi akhir yang sama.

Git menampilkan penanda konflik:

```text
PENANDA KONFLIK AWAL: lokal.txt
Olahraga
PEMISAH KONFLIK
Memasak
PENANDA KONFLIK AKHIR: lain.txt
```

## 3. Praktik git merge-base

Perintah yang digunakan:

```bash
git merge-base main HEAD
```

Hasil:

```text
2eec4d72ab5dedce5d49dd3109561cd7ec06984b
```

Perintah tersebut menemukan commit leluhur bersama antara branch `main` dan branch aktif.

## 4. Kesimpulan

Penggabungan tiga arah menggunakan kondisi base, local, dan other sebagai acuan.

Dalam fitur sinkronisasi aplikasi, pendekatan ini digunakan untuk menggabungkan penambahan, penghapusan, dan perubahan data hobi. Jika kedua sisi mengubah nilai yang sama secara berbeda, sistem mendeteksi konflik dan meminta pilihan penyelesaian.