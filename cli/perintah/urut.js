const { tulis } = require('../penyimpanan')
const { urutkanHobi } = require('../logika')

function jalankan({ judul, hobi }) {
  tulis(judul, urutkanHobi(hobi))
  console.log('Hobi berhasil diurutkan')
}

module.exports = { jalankan }