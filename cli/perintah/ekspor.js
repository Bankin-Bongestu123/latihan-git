const fs = require('fs')
const {
  eksporHobi,
  formatKolomCsv
} = require('../logika')
const { bacaKategori, bacaMinat } = require('../penyimpanan')

function eksporCsv(hobi) {
  const kategori = bacaKategori()
  const minat = bacaMinat()

  const baris = [
    ['hobi', 'kategori', 'minat'],
    ...hobi.map(nama => [
      nama,
      kategori[nama] ?? '',
      minat[nama] ?? ''
    ])
  ]

  return baris
    .map(kolom => kolom.map(formatKolomCsv).join(','))
    .join('\n')
}

function jalankan({ judul, hobi, sisa }) {
  const paksa = sisa.includes('--paksa')
  const berkas = sisa.filter(a => a !== '--paksa').join(' ').trim()

  if (!berkas) {
    console.log(eksporHobi(judul, hobi))
    return
  }

  if (berkas.toLowerCase().endsWith('.csv')) {
    if (fs.existsSync(berkas) && !paksa) {
      throw new Error(
        `File ${berkas} sudah ada. Gunakan --paksa untuk menimpa`
      )
    }

    fs.writeFileSync(berkas, eksporCsv(hobi) + '\n', 'utf8')
    console.log(`Hobi berhasil diekspor ke ${berkas}`)
    return
  }

  if (!berkas.toLowerCase().endsWith('.json')) {
    throw new Error('File ekspor harus berekstensi .json atau .csv')
  }

  if (fs.existsSync(berkas) && !paksa) {
    throw new Error(
      `File ${berkas} sudah ada. Gunakan --paksa untuk menimpa`
    )
  }

  fs.writeFileSync(berkas, eksporHobi(judul, hobi) + '\n', 'utf8')
  console.log(`Hobi berhasil diekspor ke ${berkas}`)
}

module.exports = { jalankan, eksporCsv }