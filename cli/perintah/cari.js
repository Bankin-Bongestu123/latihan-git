const { cariHobi } = require('../logika')

function jalankan({ hobi, sisa }) {
  const opsi = sisa.filter(arg => arg.startsWith('--'))
  const kata = sisa.filter(arg => !arg.startsWith('--')).join(' ').trim()

  const opsiValid = ['--ignore-case', '--exact']

  if (opsi.some(o => !opsiValid.includes(o))) {
    throw new Error('Opsi pencarian tidak dikenal')
  }

  if (opsi.length > 1) {
    throw new Error('Gunakan hanya satu opsi pencarian')
  }

  if (!kata) {
    throw new Error('Teks pencarian tidak boleh kosong')
  }

  let hasil

  if (opsi.includes('--exact')) {
    hasil = hobi.filter(h => h === kata)
  } else if (opsi.includes('--ignore-case')) {
    hasil = hobi.filter(
      h => h.toLowerCase().includes(kata.toLowerCase())
    )
  } else {
    hasil = cariHobi(hobi, kata)
  }

  hasil.forEach(h => console.log(`- ${h}`))
}

module.exports = { jalankan }