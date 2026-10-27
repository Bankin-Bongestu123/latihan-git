const { bacaKategori, tulisKategori } = require('../penyimpanan')
const { cariNamaHobi } = require('../bantu')

function jalankan({ hobi, sisa }) {
  if (sisa.length < 2) {
    throw new Error(
      'Gunakan: node cli/hobi.js kategori <nama-hobi> <nama-kategori>'
    )
  }

  const namaHobi = sisa[0].trim()
  const namaKategori = sisa.slice(1).join(' ').trim()

  if (!namaKategori) {
    throw new Error('Nama kategori tidak boleh kosong')
  }

  const hobiDitemukan = cariNamaHobi(hobi, namaHobi)

  if (!hobiDitemukan) {
    throw new Error('Hobi tidak ditemukan')
  }

  const kategori = bacaKategori()
  kategori[hobiDitemukan] = namaKategori
  tulisKategori(kategori)

  console.log(`Kategori hobi berhasil diperbarui: ${hobiDitemukan} - ${namaKategori}`)
}

module.exports = { jalankan }