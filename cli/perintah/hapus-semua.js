const readline = require('readline')
const { tulis } = require('../penyimpanan')

function konfirmasi() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('Yakin ingin menghapus semua hobi? (y/n): ', (jawaban) => {
      rl.close()
      resolve(jawaban.trim().toLowerCase())
    })
  })
}

async function jalankan({ judul }) {
  const jawaban = await konfirmasi()

  if (jawaban !== 'y') {
    console.log('Penghapusan dibatalkan')
    return
  }

  tulis(judul, [])
  console.log('Hobi berhasil dihapus semua')
}

module.exports = { jalankan }