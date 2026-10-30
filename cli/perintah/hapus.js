const { tulis } = require('../penyimpanan')
const { hapusHobi } = require('../logika')

function jalankan({ judul, hobi, argumen }) {
  tulis(judul, hapusHobi(hobi, argumen))
  console.log('Hobi berhasil dihapus')
}

module.exports = { jalankan }