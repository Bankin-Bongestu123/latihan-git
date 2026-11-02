const { hitungStatistik } = require('../logika')

function jalankan({ hobi, jsonAktif }) {
  const statistik = hitungStatistik(hobi)

  if (jsonAktif) {
    return statistik
  }

  console.log(`Total hobi: ${statistik.total}`)
  console.log(`Hobi unik: ${statistik.unik}`)
}

module.exports = { jalankan }