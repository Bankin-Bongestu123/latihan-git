const { tulis } = require('../penyimpanan')
const { tambahHobi } = require('../logika')

function jalankan({ judul, hobi, argumen }) {
  tulis(judul, tambahHobi(hobi, argumen))
  console.log('Hobi berhasil ditambahkan')
}

module.exports = { jalankan }