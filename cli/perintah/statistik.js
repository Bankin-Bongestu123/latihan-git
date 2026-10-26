const { hitungStatistik } = require('../logika')

function jalankan({ hobi }) {
  const statistik = hitungStatistik(hobi)
  console.log(`Total hobi: ${statistik.total}`)
  console.log(`Hobi unik: ${statistik.unik}`)
}

module.exports = { jalankan }