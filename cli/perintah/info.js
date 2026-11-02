const fs = require('fs')
const { bacaKategori, bacaMinat } = require('../penyimpanan')

function jalankan({ hobi, jsonAktif }) {
  const format = fs.existsSync('data.json') ? 'v2 (data.json)' : 'v1 (hobi.txt)'
  const kategori = bacaKategori()
  const minat = bacaMinat()

  const hasil = {
    format,
    jumlahHobi: hobi.length,
    hobiBerkategori: hobi.filter(h => kategori[h]).length,
    hobiBerminat: hobi.filter(h => minat[h]).length
  }

  if (jsonAktif) {
    return hasil
  }

  console.log(`Format penyimpanan: ${hasil.format}`)
  console.log(`Jumlah hobi: ${hasil.jumlahHobi}`)
  console.log(`Hobi berkategori: ${hasil.hobiBerkategori}`)
  console.log(`Hobi berminat: ${hasil.hobiBerminat}`)
}

module.exports = { jalankan }