const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { imporCsv } = require('./impor')

test('imporCsv menolak baris dengan jumlah kolom tidak valid', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-impor-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  fs.writeFileSync('hobi.txt', 'Daftar Hobi\n- Ngoding\n')
  fs.writeFileSync('kategori.json', '{}')
  fs.writeFileSync('minat.json', '{}')
  fs.writeFileSync('data.csv', 'hobi,kategori,minat\nMembaca,Teknologi\n')

  assert.throws(
    () => imporCsv({
      judul: 'Daftar Hobi',
      hobi: ['Ngoding'],
      argumen: 'data.csv'
    }),
    /baris 2/
  )

  assert.match(fs.readFileSync('hobi.txt', 'utf8'), /Ngoding/)
  assert.doesNotMatch(fs.readFileSync('hobi.txt', 'utf8'), /Membaca/)
})

test('imporCsv berhasil membaca koma dan tanda kutip dalam nama hobi', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-impor-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  fs.writeFileSync('hobi.txt', 'Daftar Hobi\n- Ngoding\n')
  fs.writeFileSync('kategori.json', '{}')
  fs.writeFileSync('minat.json', '{}')

  fs.writeFileSync(
    'data.csv',
    'hobi,kategori,minat\n"Membaca, menulis",Literasi,4\n"Belajar ""Coding""",Teknologi,5\n'
  )

  imporCsv({
    judul: 'Daftar Hobi',
    hobi: ['Ngoding'],
    argumen: 'data.csv'
  })

  const hasil = fs.readFileSync('hobi.txt', 'utf8')
  const kategori = JSON.parse(fs.readFileSync('kategori.json', 'utf8'))
  const minat = JSON.parse(fs.readFileSync('minat.json', 'utf8'))

  assert.match(hasil, /Membaca, menulis/)
  assert.match(hasil, /Belajar "Coding"/)
  assert.equal(kategori['Membaca, menulis'], 'Literasi')
  assert.equal(minat['Belajar "Coding"'], 5)
})

test('imporCsv mengabaikan hobi duplikat tanpa membedakan huruf besar kecil', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-impor-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  fs.writeFileSync('hobi.txt', 'Daftar Hobi\n- Ngoding\n')
  fs.writeFileSync('kategori.json', '{}')
  fs.writeFileSync('minat.json', '{}')

  fs.writeFileSync(
    'data.csv',
    'hobi,kategori,minat\nngoding,Teknologi,5\nMEMBACA,Literasi,4\n'
  )

  imporCsv({
    judul: 'Daftar Hobi',
    hobi: ['Ngoding'],
    argumen: 'data.csv'
  })

  const hasil = fs.readFileSync('hobi.txt', 'utf8')

  assert.equal(
    (hasil.match(/Ngoding/gi) || []).length,
    1
  )
  assert.match(hasil, /Membaca|MEMBACA/)
})

test('imporCsv tidak mengubah data kategori dan minat jika ada baris tidak valid', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-impor-'))
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

  fs.writeFileSync(
    'data.csv',
    'hobi,kategori,minat\nMembaca,Literasi,4\nOlahraga,Olahraga,9\n'
  )

  assert.throws(
    () => imporCsv({
      judul: 'Daftar Hobi',
      hobi: ['Ngoding'],
      argumen: 'data.csv'
    }),
    /baris 3/
  )

  assert.deepEqual(
    JSON.parse(fs.readFileSync('kategori.json', 'utf8')),
    { Ngoding: 'Teknologi' }
  )

  assert.deepEqual(
    JSON.parse(fs.readFileSync('minat.json', 'utf8')),
    { Ngoding: 5 }
  )

  assert.doesNotMatch(
    fs.readFileSync('hobi.txt', 'utf8'),
    /Membaca|Olahraga/
  )
})

test('imporCsv menolak header yang tidak sesuai', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-impor-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  fs.writeFileSync('hobi.txt', 'Daftar Hobi\n- Ngoding\n')
  fs.writeFileSync('kategori.json', '{}')
  fs.writeFileSync('minat.json', '{}')
  fs.writeFileSync('data.csv', 'nama,kategori,minat\nMembaca,Literasi,4\n')

  assert.throws(
    () => imporCsv({
      judul: 'Daftar Hobi',
      hobi: ['Ngoding'],
      argumen: 'data.csv'
    }),
    /Header CSV tidak valid/
  )

  assert.doesNotMatch(
    fs.readFileSync('hobi.txt', 'utf8'),
    /Membaca/
  )
})

test('imporCsv menolak nilai minat di luar rentang 1 sampai 5', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-impor-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  fs.writeFileSync('hobi.txt', 'Daftar Hobi\n- Ngoding\n')
  fs.writeFileSync('kategori.json', '{}')
  fs.writeFileSync('minat.json', '{}')
  fs.writeFileSync(
    'data.csv',
    'hobi,kategori,minat\nMembaca,Literasi,6\n'
  )

  assert.throws(
    () => imporCsv({
      judul: 'Daftar Hobi',
      hobi: ['Ngoding'],
      argumen: 'data.csv'
    }),
    /Minat tidak valid pada baris 2/
  )

  assert.doesNotMatch(
    fs.readFileSync('hobi.txt', 'utf8'),
    /Membaca/
  )
})