const fs = require('fs')
const { tambahHobi, hapusHobi, cariHobi } = require('./logika')

const FILE = 'hobi.txt'
const [, , perintah, ...sisa] = process.argv
const argumen = sisa.join(' ')

function baca() {
  const baris = fs.readFileSync(FILE, 'utf8').split(/\r?\n/)
  const judul = baris[0]
  const hobi = baris
    .slice(1)
    .filter(b => b.startsWith('- '))
    .map(b => b.slice(2).trim())
  return { judul, hobi }
}

function tulis(judul, hobi) {
  const isi = [judul, ...hobi.map(h => `- ${h}`)].join('\n') + '\n'
  fs.writeFileSync(FILE, isi, 'utf8')
}

function gagal(pesan) {
  console.error(pesan)
  process.exit(1)
}

try {
  const { judul, hobi } = baca()
  switch (perintah) {
    case 'tambah':
      tulis(judul, tambahHobi(hobi, argumen))
      break
    case 'hapus':
      tulis(judul, hapusHobi(hobi, argumen))
      break
    case 'cari':
      cariHobi(hobi, argumen).forEach(h => console.log(`- ${h}`))
      break
    case 'daftar':
      hobi.forEach(h => console.log(`- ${h}`))
      break
    default:
      gagal('Penggunaan: node cli/hobi.js <tambah|hapus|cari|daftar> [teks]')
  }
} catch (e) {
  gagal(e.message)
}