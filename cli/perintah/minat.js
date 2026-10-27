const { bacaMinat, tulisMinat } = require('../penyimpanan')
const { cariNamaHobi } = require('../bantu')

function jalankan({ hobi, sisa }) {
  if (sisa.length < 2) {
    throw new Error(
      'Gunakan: node cli/hobi.js minat <nama-hobi> <1-5>'
    )
  }

  const nilaiTeks = sisa[sisa.length - 1].trim()
  const namaHobi = sisa.slice(0, -1).join(' ').trim()

  if (!/^[1-5]$/.test(nilaiTeks)) {
    throw new Error('Tingkat minat harus angka 1 sampai 5')
  }

  const hobiDitemukan = cariNamaHobi(hobi, namaHobi)

  if (!hobiDitemukan) {
    throw new Error('Hobi tidak ditemukan')
  }

  const minat = bacaMinat()
  minat[hobiDitemukan] = Number(nilaiTeks)
  tulisMinat(minat)

  console.log(`Minat hobi berhasil diperbarui: ${hobiDitemukan} - ${nilaiTeks}`)
}

module.exports = { jalankan }