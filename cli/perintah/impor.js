const fs = require('fs')
const {
  tulis,
  bacaKategori,
  tulisKategori,
  bacaMinat,
  tulisMinat
} = require('../penyimpanan')
const {
  gabungkanHobi,
  parseCsv
} = require('../logika')

function imporJson({ judul, hobi, argumen }) {
  const isiJson = fs.readFileSync(argumen, 'utf8').replace(/^\uFEFF/, '')
  const data = JSON.parse(isiJson)

  if (!data || !Array.isArray(data.hobi)) {
    throw new Error(
      'Format JSON tidak valid: properti hobi harus berupa array'
    )
  }

  if (!data.hobi.every(nama => typeof nama === 'string')) {
    throw new Error(
      'Format JSON tidak valid: setiap hobi harus berupa teks'
    )
  }

  const hasil = gabungkanHobi(hobi, data.hobi)
  tulis(judul, hasil)
  console.log(`Impor berhasil. Total hobi sekarang: ${hasil.length}`)
}

function imporCsv({ judul, hobi, argumen }) {
  const isiCsv = fs.readFileSync(argumen, 'utf8').replace(/^\uFEFF/, '')
  const baris = parseCsv(isiCsv)

  // Validasi header CSV
  if (
    !baris.length ||
    baris[0].join(',') !== 'hobi,kategori,minat'
  ) {
    throw new Error('Header CSV tidak valid. Gunakan: hobi,kategori,minat')
  }

  const kategori = { ...bacaKategori() }
  const minat = { ...bacaMinat() }
  const tambahan = []

  // Validasi seluruh baris sebelum menyimpan perubahan
  for (let i = 1; i < baris.length; i++) {
    const nomorBaris = i + 1
    const [nama, namaKategori, nilaiMinat, ...sisa] = baris[i]

    if (
      baris[i].length !== 3 ||
      sisa.length > 0 ||
      !nama ||
      !nama.trim()
    ) {
      throw new Error(`Data CSV tidak valid pada baris ${nomorBaris}`)
    }

    if (nilaiMinat !== '' && !/^[1-5]$/.test(nilaiMinat)) {
      throw new Error(`Minat tidak valid pada baris ${nomorBaris}. Gunakan angka 1 sampai 5`)
    }

    tambahan.push(nama.trim())
  }

  const hasil = gabungkanHobi(hobi, tambahan)

  // Gabungkan kategori dan minat berdasarkan nama hobi
  for (let i = 1; i < baris.length; i++) {
    const [nama, namaKategori, nilaiMinat] = baris[i]
    const namaAsli = hasil.find(
      item => item.toLowerCase() === nama.trim().toLowerCase()
    )

    if (namaKategori) kategori[namaAsli] = namaKategori
    if (nilaiMinat) minat[namaAsli] = Number(nilaiMinat)
  }

  tulis(judul, hasil)
  tulisKategori(kategori)
  tulisMinat(minat)

  console.log(`Impor CSV berhasil. Total hobi sekarang: ${hasil.length}`)
}

function jalankan({ judul, hobi, argumen }) {
  if (!argumen) {
    throw new Error(
      'Gunakan: node cli/hobi.js impor <file.json atau file.csv>'
    )
  }

  if (argumen.toLowerCase().endsWith('.csv')) {
    return imporCsv({ judul, hobi, argumen })
  }

  return imporJson({ judul, hobi, argumen })
}

module.exports = { jalankan, imporCsv, imporJson }