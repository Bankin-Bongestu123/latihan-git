const fs = require('fs')
const { eksporHobi } = require('../logika')

function jalankan({ judul, hobi, sisa }) {
  const paksa = sisa.includes('--paksa')
  const berkas = sisa.filter(a => a !== '--paksa').join(' ').trim()

  if (!berkas) {
    console.log(eksporHobi(judul, hobi))
    return
  }

  if (!berkas.toLowerCase().endsWith('.json')) {
    throw new Error('File ekspor harus berekstensi .json')
  }

  if (fs.existsSync(berkas) && !paksa) {
    throw new Error(
      `File ${berkas} sudah ada. Gunakan --paksa untuk menimpa`
    )
  }

  fs.writeFileSync(berkas, eksporHobi(judul, hobi) + '\n', 'utf8')
  console.log(`Hobi berhasil diekspor ke ${berkas}`)
}

module.exports = { jalankan }