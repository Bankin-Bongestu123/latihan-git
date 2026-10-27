const { bacaKategori, tulisKategori } = require('../penyimpanan')
const { cariNamaHobi } = require('../bantu')

function jalankan({ hobi, argumen }) {
  const namaHobi = argumen.trim()

  if (!namaHobi) {
    throw new Error(
      'Gunakan: node cli/hobi.js hapus-kategori <nama-hobi>'
    )
  }

  const hobiDitemukan = cariNamaHobi(hobi, namaHobi)

  if (!hobiDitemukan) {
    throw new Error('Hobi tidak ditemukan')
  }

  const kategori = bacaKategori()

  if (!kategori[hobiDitemukan]) {
    throw new Error(`Hobi "${hobiDitemukan}" belum memiliki kategori`)
  }

  delete kategori[hobiDitemukan]
  tulisKategori(kategori)

  console.log(`Kategori hobi "${hobiDitemukan}" berhasil dihapus`)
}

module.exports = { jalankan }