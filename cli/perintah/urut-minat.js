const { bacaMinat } = require('../penyimpanan')

function jalankan({ hobi, jsonAktif }) {
  if (hobi.length === 0) {
    throw new Error('Belum ada hobi')
  }

  const minat = bacaMinat()

  const hasil = hobi
    .slice()
    .sort((a, b) => {
      const selisih = (minat[b] || 0) - (minat[a] || 0)
      return selisih !== 0
        ? selisih
        : a.localeCompare(b, 'id', { sensitivity: 'base' })
    })
    .map(nama => ({
      nama,
      minat: minat[nama] || null
    }))

  if (jsonAktif) {
    return hasil
  }

  hasil.forEach(({ nama, minat: nilai }) => {
    console.log(
      nilai
        ? `- ${nama} (minat: ${nilai})`
        : `- ${nama} (belum ada minat)`
    )
  })
}

module.exports = { jalankan }