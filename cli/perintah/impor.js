const fs = require('fs')
const { tulis } = require('../penyimpanan')
const { gabungkanHobi } = require('../logika')

function jalankan({ judul, hobi, argumen }) {
  if (!argumen) {
    throw new Error(
      'Gunakan: node cli/hobi.js impor <file.json>'
    )
  }

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

module.exports = { jalankan }