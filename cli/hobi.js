const { baca } = require('./penyimpanan')

const PERINTAH = {
  tambah: require('./perintah/tambah'),
  hapus: require('./perintah/hapus'),
  'hapus-semua': require('./perintah/hapus-semua'),
  edit: require('./perintah/edit'),
  cari: require('./perintah/cari'),
  daftar: require('./perintah/daftar'),
  urut: require('./perintah/urut'),
  ekspor: require('./perintah/ekspor'),
  statistik: require('./perintah/statistik'),
  impor: require('./perintah/impor'),
  kategori: require('./perintah/kategori'),
  'hapus-kategori': require('./perintah/hapus-kategori'),
  'daftar-kategori': require('./perintah/daftar-kategori'),
  'semua-kategori': require('./perintah/semua-kategori'),
  minat: require('./perintah/minat'),
  'urut-minat': require('./perintah/urut-minat')
}

const [, , perintah, ...sisa] = process.argv
const argumen = sisa.join(' ')

function gagal(pesan) {
  console.error(pesan)
  process.exit(1)
}

async function main() {
  try {
    const { judul, hobi } = baca()

    if (!Object.hasOwn(PERINTAH, perintah)) {
      gagal(
        'Penggunaan: node cli/hobi.js <tambah|hapus|hapus-semua|kategori|hapus-kategori|daftar-kategori|semua-kategori|cari|daftar|urut|minat|urut-minat|ekspor|statistik|impor> [teks]'
      )
    }

    await PERINTAH[perintah].jalankan({ judul, hobi, sisa, argumen })
  } catch (e) {
    gagal(e.message)
  }
}

main()