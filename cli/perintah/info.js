const fs = require('fs')
const { bacaKategori, bacaMinat } = require('../penyimpanan')

function jalankan({ hobi }) {
  const format = fs.existsSync('data.json') ? 'v2 (data.json)' : 'v1 (hobi.txt)'
  const kategori = bacaKategori()
  const minat = bacaMinat()

  console.log(`Format penyimpanan: ${format}`)
  console.log(`Jumlah hobi: ${hobi.length}`)
  console.log(`Hobi berkategori: ${hobi.filter(h => kategori[h]).length}`)
  console.log(`Hobi berminat: ${hobi.filter(h => minat[h]).length}`)
}

module.exports = { jalankan }