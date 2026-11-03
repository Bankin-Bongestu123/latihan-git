const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { eksporCsv } = require('./ekspor')

test('eksporCsv menghasilkan header dan data hobi', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-csv-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)
  fs.writeFileSync('hobi.txt', 'Daftar Hobi\n- Ngoding\n')
  fs.writeFileSync('kategori.json', JSON.stringify({
    Ngoding: 'Teknologi'
  }))
  fs.writeFileSync('minat.json', JSON.stringify({
    Ngoding: 5
  }))

  assert.strictEqual(
    eksporCsv(['Ngoding']),
    'hobi,kategori,minat\nNgoding,Teknologi,5'
  )
})

test('eksporCsv menangani koma dan tanda kutip dengan benar', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-csv-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  fs.writeFileSync('hobi.txt', 'Daftar Hobi\n')
  fs.writeFileSync('kategori.json', JSON.stringify({
    'Membaca, menulis': 'Literasi',
    'Belajar "Coding"': 'Teknologi'
  }))
  fs.writeFileSync('minat.json', JSON.stringify({
    'Membaca, menulis': 4,
    'Belajar "Coding"': 5
  }))

  const hasil = eksporCsv([
    'Membaca, menulis',
    'Belajar "Coding"'
  ])

  assert.equal(
    hasil,
    'hobi,kategori,minat\n"Membaca, menulis",Literasi,4\n"Belajar ""Coding""",Teknologi,5'
  )
})

test('perintah ekspor menulis file CSV', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-csv-'))
  const folderAwal = process.cwd()
  const logAwal = console.log
  const pesan = []

  t.after(() => {
    process.chdir(folderAwal)
    console.log = logAwal
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)
  console.log = (teks) => pesan.push(teks)

  require('./ekspor').jalankan({
    judul: 'Daftar Hobi',
    hobi: ['Ngoding'],
    sisa: ['hasil.csv']
  })

  assert.equal(
    fs.readFileSync('hasil.csv', 'utf8'),
    'hobi,kategori,minat\nNgoding,,\n'
  )
  assert.match(pesan[0], /berhasil diekspor/)
})

test('eksporCsv menolak menimpa file yang sudah ada tanpa --paksa', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-csv-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)
  fs.writeFileSync('hasil.csv', 'data lama')

  assert.throws(
    () => require('./ekspor').jalankan({
      judul: 'Daftar Hobi',
      hobi: ['Ngoding'],
      sisa: ['hasil.csv']
    }),
    /sudah ada/
  )

  assert.equal(
    fs.readFileSync('hasil.csv', 'utf8'),
    'data lama'
  )
})

test('eksporCsv dapat menimpa file dengan opsi --paksa', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-csv-'))
  const folderAwal = process.cwd()
  const logAwal = console.log

  t.after(() => {
    process.chdir(folderAwal)
    console.log = logAwal
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)
  console.log = () => {}

  fs.writeFileSync('hasil.csv', 'data lama')

  require('./ekspor').jalankan({
    judul: 'Daftar Hobi',
    hobi: ['Ngoding'],
    sisa: ['hasil.csv', '--paksa']
  })

  assert.equal(
    fs.readFileSync('hasil.csv', 'utf8'),
    'hobi,kategori,minat\nNgoding,,\n'
  )
})