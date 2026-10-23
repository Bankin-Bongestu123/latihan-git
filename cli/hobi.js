
const fs = require('fs')
const {
  tambahHobi,
  hapusHobi,
  cariHobi,
  urutkanHobi,
  eksporHobi,
  hitungStatistik,
  gabungkanHobi
} = require('./logika')

const FILE = 'hobi.txt'
const [, , perintah, ...sisa] = process.argv
const argumen = sisa.join(' ')

function baca() {
  if (!fs.existsSync(FILE)) {
    throw new Error('File hobi.txt tidak ditemukan')
  }

  const baris = fs.readFileSync(FILE, 'utf8').split(/\r?\n/)
  const judul = baris[0] && baris[0].trim()
    ? baris[0]
    : 'Daftar Hobi'

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
      console.log('Hobi berhasil ditambahkan')
      break

    case 'hapus':
      tulis(judul, hapusHobi(hobi, argumen))
      console.log('Hobi berhasil dihapus')
      break

    case 'cari':
      cariHobi(hobi, argumen).forEach(h => console.log(`- ${h}`))
      break

    case 'daftar':
      hobi.forEach(h => console.log(`- ${h}`))
      break

    case 'urut':
      tulis(judul, urutkanHobi(hobi))
      console.log('Hobi berhasil diurutkan')
      break

    case 'ekspor':
      console.log(eksporHobi(judul, hobi))
      break

    case 'statistik': {
      const statistik = hitungStatistik(hobi)
      console.log(`Total hobi: ${statistik.total}`)
      console.log(`Hobi unik: ${statistik.unik}`)
      break
    }

    case 'impor': {
      if (!argumen) {
        throw new Error(
          'Gunakan: node cli/hobi.js impor <file.json>'
        )
      }

      const isiJson = fs.readFileSync(argumen, 'utf8').replace(/^\uFEFF/, '')
      const data = JSON.parse(isiJson)

            if (!data || !Array.isArray(data.hobi)) {
        throw new Error(
          'Format JSON tidak valid: properti hobi harus berupa array'
        )
      }

      if (!data.hobi.every(nama => typeof nama === 'string')) {
        throw new Error(
          'Format JSON tidak valid: setiap hobi harus berupa teks'
        )
      }

      const hasil = gabungkanHobi(hobi, data.hobi)
      tulis(judul, hasil)
      console.log(`Impor berhasil. Total hobi sekarang: ${hasil.length}`)
      break
    }

    default:
      gagal(
        'Penggunaan: node cli/hobi.js <tambah|hapus|cari|daftar|urut|ekspor|statistik|impor> [teks]'
      )
  }
} catch (e) {
  gagal(e.message)
}
