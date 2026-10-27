const { bacaKategori } = require('../penyimpanan')

function jalankan({ hobi }) {
  if (hobi.length === 0) {
    throw new Error('Belum ada hobi')
  }

  const kategori = bacaKategori()
  const hitung = new Map()

  hobi.forEach(nama => {
    const nilai = (kategori[nama] || '').trim() || 'Tanpa Kategori'
    const kunci = nilai.toLowerCase()
    const ada = hitung.get(kunci)

    if (ada) {
      ada.jumlah++
    } else {
      hitung.set(kunci, { nama: nilai, jumlah: 1 })
    }
  })

  Array.from(hitung.values())
    .sort((a, b) =>
      a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' })
    )
    .forEach(k => console.log(`- ${k.nama}: ${k.jumlah} hobi`))
}

module.exports = { jalankan }