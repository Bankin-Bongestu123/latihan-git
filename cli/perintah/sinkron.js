const fs = require('fs')
const {
  FILE_DATA,
  bacaData,
  tulisData,
  tulisAtomik,
  adaV2
} = require('../penyimpanan')

const FILE_BASIS = '.sinkron-basis.json'

function bacaBerkasJson(berkas) {
  let data

  try {
    data = JSON.parse(fs.readFileSync(berkas, 'utf8'))
  } catch {
    throw new Error(`File ${berkas} tidak ditemukan atau JSON tidak valid`)
  }

  if (
    data === null ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    !Array.isArray(data.hobi) ||
    !data.hobi.every(h => typeof h === 'string')
  ) {
    throw new Error(`Format ${berkas} tidak valid`)
  }

  return {
    judul: typeof data.judul === 'string' ? data.judul : 'Daftar Hobi',
    hobi: data.hobi,
    kategori: data.kategori && typeof data.kategori === 'object' && !Array.isArray(data.kategori)
      ? data.kategori
      : {},
    minat: data.minat && typeof data.minat === 'object' && !Array.isArray(data.minat)
      ? data.minat
      : {}
  }
}

function bacaBasis() {
  if (!fs.existsSync(FILE_BASIS)) {
    throw new Error(
      'Snapshot basis tidak ditemukan. Sinkronisasi belum dapat dilakukan.'
    )
  }

  return bacaBerkasJson(FILE_BASIS)
}

function bacaDataLokal() {
  if (!adaV2()) {
    throw new Error(
      'data.json tidak ditemukan. Jalankan migrasi terlebih dahulu.'
    )
  }

  return bacaData()
}

function berubah(nilaiBasis, nilaiSekarang) {
  return nilaiBasis !== nilaiSekarang
}

function gabungkanNilai(nilaiBasis, nilaiLokal, nilaiLain, pilihan = null) {
  const lokalBerubah = berubah(nilaiBasis, nilaiLokal)
  const lainBerubah = berubah(nilaiBasis, nilaiLain)

  if (!lokalBerubah) {
    return nilaiLain
  }

  if (!lainBerubah) {
    return nilaiLokal
  }

  if (nilaiLokal === nilaiLain) {
    return nilaiLokal
  }
        if (pilihan === 'lokal') {
  return nilaiLokal
}

if (pilihan === 'lain') {
  return nilaiLain
}

const error = new Error('Konflik perubahan')
error.nilaiBasis = nilaiBasis
error.nilaiLokal = nilaiLokal
error.nilaiLain = nilaiLain
throw error
}

function gabungkanDaftarHobi(basis, lokal, lain, pilihan = null) {
  const semuaHobi = [...new Set([
    ...basis,
    ...lokal,
    ...lain
  ])]

  return semuaHobi.filter(nama => {
    const adaDiBasis = basis.includes(nama)
    const adaDiLokal = lokal.includes(nama)
    const adaDiLain = lain.includes(nama)

    return gabungkanNilai(
      adaDiBasis,
      adaDiLokal,
      adaDiLain,
      pilihan
    )
  })
}

function gabungkanPeta(basis, lokal, lain, pilihan = null) {
  const semuaKunci = [...new Set([
    ...Object.keys(basis),
    ...Object.keys(lokal),
    ...Object.keys(lain)
  ])]

  const hasil = {}

  for (const kunci of semuaKunci) {
    const nilai = gabungkanNilai(
        basis[kunci],
        lokal[kunci],
        lain[kunci],
        pilihan
)

    if (nilai !== undefined) {
      hasil[kunci] = nilai
    }
  }

  return hasil
}

function gabungkanTigaArah(basis, lokal, lain, pilihan = null) {
  const hobi = gabungkanDaftarHobi(
    basis.hobi,
    lokal.hobi,
    lain.hobi,
    pilihan
  )

  const kategoriGabungan = gabungkanPeta(
  basis.kategori,
  lokal.kategori,
  lain.kategori,
  pilihan
  )

  const minatGabungan = gabungkanPeta(
  basis.minat,
  lokal.minat,
  lain.minat,
  pilihan
)

  const kategori = Object.fromEntries(
    Object.entries(kategoriGabungan)
      .filter(([nama]) => hobi.includes(nama))
  )

  const minat = Object.fromEntries(
    Object.entries(minatGabungan)
      .filter(([nama]) => hobi.includes(nama))
  )

  return {
    ...lokal,
    hobi,
    kategori,
    minat
  }
}

function simpanHasilAtomik(hasil) {
  const dataLama = fs.readFileSync(FILE_DATA, 'utf8')
  const basisLama = fs.readFileSync(FILE_BASIS, 'utf8')

  try {
    tulisData(hasil)

    tulisAtomik(
      FILE_BASIS,
      JSON.stringify(hasil, null, 2) + '\n'
    )
  } catch (error) {
    try {
      tulisAtomik(FILE_DATA, dataLama)
      tulisAtomik(FILE_BASIS, basisLama)
    } catch {
      throw new Error(
        'Penyimpanan gagal dan pemulihan otomatis juga gagal. Periksa data.json dan .sinkron-basis.json.'
      )
    }

    throw error
  }
}

function jalankan({ sisa = [] }) {
  const pilihanLokal = sisa.includes('--pilih-lokal')
  const pilihanLain = sisa.includes('--pilih-lain')

  if (pilihanLokal && pilihanLain) {
    throw new Error(
      'Pilih salah satu: --pilih-lokal atau --pilih-lain'
    )
  }

  const pilihan = pilihanLokal
    ? 'lokal'
    : pilihanLain
      ? 'lain'
      : null

  const berkasLain = sisa.find(argumen => !argumen.startsWith('--'))

  if (!berkasLain) {
    throw new Error(
      'Gunakan: node cli/hobi.js sinkron <file.json> [--pilih-lokal|--pilih-lain]'
    )
  }

  const basis = bacaBasis()
  const lokal = bacaDataLokal()
  const lain = bacaBerkasJson(berkasLain)

  const hasil = gabungkanTigaArah(
    basis,
    lokal,
    lain,
    pilihan
  )

  simpanHasilAtomik(hasil)


  console.log(
    `Sinkronisasi berhasil. Total hobi: ${hasil.hobi.length}`
  )
}

module.exports = {
  jalankan,
  berubah,
  gabungkanNilai,
  gabungkanDaftarHobi,
  gabungkanPeta,
  gabungkanTigaArah,
  simpanHasilAtomik
}