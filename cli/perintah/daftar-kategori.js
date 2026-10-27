const { bacaKategori } = require('../penyimpanan')

function jalankan({ hobi, sisa }) {
  const namaKategori = sisa.join(' ').trim()

  if (!namaKategori) {
    throw new Error(
      'Gunakan: node cli/hobi.js daftar-kategori <nama-kategori>'
    )
  }

  const kategori = bacaKategori()

  const hasil = hobi.filter(nama => {
    const kategoriHobi = kategori[nama]
    return kategoriHobi &&
      kategoriHobi.toLowerCase() === namaKategori.toLowerCase()
  })

  if (hasil.length === 0) {
    throw new Error('Belum ada hobi dalam kategori tersebut')
  }

  hasil.forEach(nama => console.log(`- ${nama}`))
}

module.exports = { jalankan }