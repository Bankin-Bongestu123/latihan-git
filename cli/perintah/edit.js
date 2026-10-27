const { tulis } = require('../penyimpanan')
const { editHobi } = require('../logika')

function jalankan({ judul, hobi, sisa }) {
  if (sisa.length < 2) {
    throw new Error(
      'Gunakan: node cli/hobi.js edit <nama-lama> <nama-baru>'
    )
  }

  const namaLama = sisa[0]
  const namaBaru = sisa.slice(1).join(' ')

  tulis(judul, editHobi(hobi, namaLama, namaBaru))
  console.log('Hobi berhasil diperbarui')
}

module.exports = { jalankan }