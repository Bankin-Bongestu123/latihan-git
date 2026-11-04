const { baca, denganKunci } = require('./penyimpanan')
const { ambilKeadaan, catatPerubahan } = require('./riwayat')

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
  'urut-minat': require('./perintah/urut-minat'),
  batal: require('./perintah/batal'),
    migrasi: require('./perintah/migrasi'),
    info: require('./perintah/info'),
    sinkron: require('./perintah/sinkron')
}

const MENGUBAH = new Set([
  'tambah',
  'hapus',
  'hapus-semua',
  'edit',
  'urut',
  'impor',
  'kategori',
  'hapus-kategori',
  'minat',
  'migrasi',
  'sinkron'
])

const PERLU_KUNCI = new Set([...MENGUBAH, 'batal'])

const PERINTAH_JSON = new Set([
  'daftar',
  'cari',
  'statistik',
  'semua-kategori',
  'urut-minat',
  'info'
])

const argumenCli = process.argv.slice(2)
const jsonAktif = argumenCli.includes('--json')
const argumenBersih = argumenCli.filter(arg => arg !== '--json')

const [perintah, ...sisa] = argumenBersih
const argumen = sisa.join(' ')

function gagal(pesan) {
  if (jsonAktif) {
    console.error(JSON.stringify({ error: pesan }))
  } else {
    console.error(pesan)
  }

  process.exitCode = 1
}

async function main() {
  try {
        if (perintah === 'serve') {
      const { jalankanServer } = require('./serve')
      await jalankanServer(sisa)
      return
    }
    if (!Object.hasOwn(PERINTAH, perintah)) {
      throw new Error(
'Penggunaan: node cli/hobi.js <tambah|hapus|hapus-semua|edit|cari|daftar|urut|ekspor|statistik|impor|kategori|hapus-kategori|daftar-kategori|semua-kategori|minat|urut-minat|batal|migrasi|info|sinkron> [teks]'      )
    }

    const jalankanPerintah = async () => {
      const { judul, hobi } = baca()

      const sebelum = MENGUBAH.has(perintah)
        ? ambilKeadaan()
        : null

      const hasil = await PERINTAH[perintah].jalankan({
        judul,
        hobi,
        sisa,
        argumen,
        jsonAktif
      })

      if (jsonAktif && PERINTAH_JSON.has(perintah)) {
        console.log(JSON.stringify(hasil))
      }

      if (sebelum) {
        catatPerubahan(sebelum)
      }
    }

    if (PERLU_KUNCI.has(perintah)) {
      await denganKunci(jalankanPerintah)
    } else {
      await jalankanPerintah()
    }
  } catch (e) {
    gagal(e.message)
  }
}

main()