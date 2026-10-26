const readline = require('readline')
const fs = require('fs')
const {
  tambahHobi,
  hapusHobi,
  editHobi,
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

const FILE_KATEGORI = 'kategori.json'

function bacaKategori() {
  if (!fs.existsSync(FILE_KATEGORI)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(FILE_KATEGORI, 'utf8'))
}

function tulisKategori(data) {
  fs.writeFileSync(
    FILE_KATEGORI,
    JSON.stringify(data, null, 2) + '\n',
    'utf8'
  )
}

const FILE_MINAT = 'minat.json'

function bacaMinat() {
  if (!fs.existsSync(FILE_MINAT)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(FILE_MINAT, 'utf8'))
}

function tulisMinat(data) {
  fs.writeFileSync(
    FILE_MINAT,
    JSON.stringify(data, null, 2) + '\n',
    'utf8'
  )
}

function cariNamaHobi(daftar, nama) {
  const kunci = nama.trim().toLowerCase()
  return daftar.find(h => h.toLowerCase() === kunci)
}

function gagal(pesan) {
  console.error(pesan)
  process.exit(1)
}

function konfirmasiHapusSemua() {
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

async function main() {
  try {
    const { judul, hobi } = baca()

    switch (perintah) {
      
    case 'kategori': {
      if (sisa.length < 2) {
        throw new Error(
          'Gunakan: node cli/hobi.js kategori <nama-hobi> <nama-kategori>'
        )
      }

      const namaHobi = sisa[0].trim()
      const namaKategori = sisa.slice(1).join(' ').trim()

      if (!namaKategori) {
        throw new Error('Nama kategori tidak boleh kosong')
      }

      const hobiDitemukan = cariNamaHobi(hobi, namaHobi)

      if (!hobiDitemukan) {
        throw new Error('Hobi tidak ditemukan')
      }

      const kategori = bacaKategori()
      kategori[hobiDitemukan] = namaKategori
      tulisKategori(kategori)

      console.log(`Kategori hobi berhasil diperbarui: ${hobiDitemukan} - ${namaKategori}`)
      break
    }

    case 'daftar-kategori': {
      const namaKategori = sisa.join(' ').trim()

      if (!namaKategori) {
        throw new Error(
          'Gunakan: node cli/hobi.js daftar-kategori <nama-kategori>'
        )
      }

      const kategori = bacaKategori()

      const hasil = hobi.filter(nama => {
        const kategoriHobi = kategori[nama]
        return kategoriHobi &&
          kategoriHobi.toLowerCase() === namaKategori.toLowerCase()
      })

      if (hasil.length === 0) {
        throw new Error('Belum ada hobi dalam kategori tersebut')
      }

      hasil.forEach(nama => console.log(`- ${nama}`))
      break
    }

        case 'hapus-kategori': {
      const namaHobi = argumen.trim()

      if (!namaHobi) {
        throw new Error(
          'Gunakan: node cli/hobi.js hapus-kategori <nama-hobi>'
        )
      }

      const hobiDitemukan = cariNamaHobi(hobi, namaHobi)

      if (!hobiDitemukan) {
        throw new Error('Hobi tidak ditemukan')
      }

      const kategori = bacaKategori()

      if (!kategori[hobiDitemukan]) {
        throw new Error(`Hobi "${hobiDitemukan}" belum memiliki kategori`)
      }

      delete kategori[hobiDitemukan]
      tulisKategori(kategori)

      console.log(`Kategori hobi "${hobiDitemukan}" berhasil dihapus`)
      break
    }

        case 'semua-kategori': {
      if (hobi.length === 0) {
        throw new Error('Belum ada hobi')
      }

      const kategori = bacaKategori()
      const hitung = new Map()

      hobi.forEach(nama => {
        const nilai = (kategori[nama] || '').trim() || 'Tanpa Kategori'
        const kunci = nilai.toLowerCase()
        const ada = hitung.get(kunci)

        if (ada) {
          ada.jumlah++
        } else {
          hitung.set(kunci, { nama: nilai, jumlah: 1 })
        }
      })

      Array.from(hitung.values())
        .sort((a, b) =>
          a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' })
        )
        .forEach(k => console.log(`- ${k.nama}: ${k.jumlah} hobi`))
      break
    }

        case 'minat': {
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
      break
    }

    case 'urut-minat': {
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
      break
    }

    case 'tambah':
      tulis(judul, tambahHobi(hobi, argumen))
      console.log('Hobi berhasil ditambahkan')
      break

    case 'hapus':
      tulis(judul, hapusHobi(hobi, argumen))
      console.log('Hobi berhasil dihapus')
      break

    case 'edit': {
  if (sisa.length < 2) {
    throw new Error(
      'Gunakan: node cli/hobi.js edit <nama-lama> <nama-baru>'
    )
  }

  const namaLama = sisa[0]
  const namaBaru = sisa.slice(1).join(' ')

  tulis(judul, editHobi(hobi, namaLama, namaBaru))
  console.log('Hobi berhasil diperbarui')
  break
}
case 'cari': {
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
  break
}


    case 'daftar':
      hobi.forEach(h => console.log(`- ${h}`))
      break

    case 'urut':
      tulis(judul, urutkanHobi(hobi))
      console.log('Hobi berhasil diurutkan')
      break

        case 'ekspor': {
      const paksa = sisa.includes('--paksa')
      const berkas = sisa.filter(a => a !== '--paksa').join(' ').trim()

      if (!berkas) {
        console.log(eksporHobi(judul, hobi))
        break
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
      break
    }

        case 'hapus-semua': {
      const jawaban = await konfirmasiHapusSemua()

      if (jawaban !== 'y') {
        console.log('Penghapusan dibatalkan')
        break
      }

      tulis(judul, [])
      console.log('Hobi berhasil dihapus semua')
      break
    }

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
'Penggunaan: node cli/hobi.js <tambah|hapus|hapus-semua|kategori|hapus-kategori|daftar-kategori|semua-kategori|cari|daftar|urut|minat|urut-minat|ekspor|statistik|impor> [teks]'     )
      }
  } catch (e) {
    gagal(e.message)
  }
}

main()
