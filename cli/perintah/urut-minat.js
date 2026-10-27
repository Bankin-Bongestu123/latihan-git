const { bacaMinat } = require('../penyimpanan')

function jalankan({ hobi }) {
  if (hobi.length === 0) {
    throw new Error('Belum ada hobi')
  }

  const minat = bacaMinat()

  hobi
    .slice()
    .sort((a, b) => {
      const selisih = (minat[b] || 0) - (minat[a] || 0)
      return selisih !== 0
        ? selisih
        : a.localeCompare(b, 'id', { sensitivity: 'base' })
    })
    .forEach(nama => {
      console.log(
        minat[nama]
          ? `- ${nama} (minat: ${minat[nama]})`
          : `- ${nama} (belum ada minat)`
      )
    })
}

module.exports = { jalankan }