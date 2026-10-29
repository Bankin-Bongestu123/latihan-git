const fs = require('fs')
const path = require('path')
const {
  FILE,
  FILE_KATEGORI,
  FILE_MINAT,
  tulisAtomik
} = require('./penyimpanan')

const FOLDER = '.riwayat'
const MAKS = 10
const BERKAS = { hobi: FILE, kategori: FILE_KATEGORI, minat: FILE_MINAT }

function ambilKeadaan() {
  const keadaan = {}

  for (const [kunci, nama] of Object.entries(BERKAS)) {
    keadaan[kunci] = fs.existsSync(nama)
      ? fs.readFileSync(nama, 'utf8')
      : null
  }

  return keadaan
}

function daftarRiwayat() {
  if (!fs.existsSync(FOLDER)) {
    return []
  }

  return fs.readdirSync(FOLDER)
    .filter(nama => /^\d{6}\.json$/.test(nama))
    .sort()
}

function catatPerubahan(sebelum) {
  const sekarang = ambilKeadaan()

  if (JSON.stringify(sebelum) === JSON.stringify(sekarang)) {
    return
  }

  fs.mkdirSync(FOLDER, { recursive: true })

  const daftar = daftarRiwayat()
  const terakhir = daftar.length
    ? parseInt(daftar[daftar.length - 1], 10)
    : 0
  const nama = String(terakhir + 1).padStart(6, '0') + '.json'

  tulisAtomik(
    path.join(FOLDER, nama),
    JSON.stringify(sebelum, null, 2) + '\n'
  )

  const semua = daftarRiwayat()
  semua
    .slice(0, Math.max(0, semua.length - MAKS))
    .forEach(lama => fs.rmSync(path.join(FOLDER, lama)))
}

function pulihkanTerakhir() {
  const daftar = daftarRiwayat()

  if (daftar.length === 0) {
    throw new Error('Tidak ada perubahan yang bisa dibatalkan')
  }

  const berkasTerakhir = path.join(FOLDER, daftar[daftar.length - 1])
  const keadaan = JSON.parse(fs.readFileSync(berkasTerakhir, 'utf8'))

  for (const [kunci, nama] of Object.entries(BERKAS)) {
    if (keadaan[kunci] === null) {
      fs.rmSync(nama, { force: true })
    } else {
      tulisAtomik(nama, keadaan[kunci])
    }
  }

  fs.rmSync(berkasTerakhir)
}

module.exports = { ambilKeadaan, catatPerubahan, pulihkanTerakhir }