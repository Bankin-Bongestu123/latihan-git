const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const CLI = path.join(__dirname, 'hobi.js')

function siapkanFolder(t) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-hobi-'))

  fs.writeFileSync(
    path.join(folder, 'hobi.txt'),
    'Daftar Hobi\n- Ngoding\n- Membaca\n',
    'utf8'
  )

  t.after(() => {
    fs.rmSync(folder, { recursive: true, force: true })
  })

  return folder
}

function jalankan(folder, ...args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: folder,
    encoding: 'utf8'
  })
}

test('CLI statistik menampilkan total dan hobi unik', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'statistik')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Total hobi: 2/)
  assert.match(hasil.stdout, /Hobi unik: 2/)
})

test('CLI impor menambahkan hobi baru dan mengabaikan duplikat', (t) => {
  const folder = siapkanFolder(t)
  const fileImpor = path.join(folder, 'impor.json')

  fs.writeFileSync(
    fileImpor,
    JSON.stringify({
      judul: 'Hobi Impor',
      hobi: ['Membaca', 'Bermain Catur']
    }),
    'utf8'
  )

  const hasil = jalankan(folder, 'impor', fileImpor)
  const isiHobi = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Impor berhasil/)
  assert.equal(
    isiHobi,
    'Daftar Hobi\n- Ngoding\n- Membaca\n- Bermain Catur\n'
  )
})

test('CLI impor menolak JSON yang tidak valid', (t) => {
  const folder = siapkanFolder(t)
  const fileImpor = path.join(folder, 'impor.json')
  const fileHobi = path.join(folder, 'hobi.txt')
  const isiAwal = fs.readFileSync(fileHobi, 'utf8')

  fs.writeFileSync(fileImpor, '{ json salah', 'utf8')

  const hasil = jalankan(folder, 'impor', fileImpor)

  assert.equal(hasil.status, 1)
  assert.equal(fs.readFileSync(fileHobi, 'utf8'), isiAwal)
})

test('CLI impor menolak format tanpa array hobi', (t) => {
  const folder = siapkanFolder(t)
  const fileImpor = path.join(folder, 'impor.json')

  fs.writeFileSync(
    fileImpor,
    JSON.stringify({ judul: 'Hobi Impor', hobi: 'Ngoding' }),
    'utf8'
  )

  const hasil = jalankan(folder, 'impor', fileImpor)

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Format JSON tidak valid/)
})


test('CLI impor menolak hobi yang bukan teks', (t) => {
  const folder = siapkanFolder(t)
  const fileImpor = path.join(folder, 'impor.json')
  const fileHobi = path.join(folder, 'hobi.txt')
  const isiAwal = fs.readFileSync(fileHobi, 'utf8')

  fs.writeFileSync(
    fileImpor,
    JSON.stringify({ hobi: ['Ngoding', 123] }),
    'utf8'
  )

  const hasil = jalankan(folder, 'impor', fileImpor)

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /setiap hobi harus berupa teks/)
  assert.equal(fs.readFileSync(fileHobi, 'utf8'), isiAwal)
})

test('CLI mengembalikan kode 1 jika hobi.txt tidak ditemukan', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-hobi-'))

  t.after(() => {
    fs.rmSync(folder, { recursive: true, force: true })
  })

  const hasil = jalankan(folder, 'statistik')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /hobi.txt tidak ditemukan/)
})

test('CLI impor mengembalikan kode 1 jika file JSON tidak diberikan', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'impor')

  assert.equal(hasil.status, 1)
assert.match(hasil.stderr, /Gunakan: node cli\/hobi\.js impor/)
})


test('CLI hapus-semua menghapus seluruh hobi setelah konfirmasi y', (t) => {
  const folder = siapkanFolder(t)
  const hasil = spawnSync(
    process.execPath,
    [CLI, 'hapus-semua'],
    {
      cwd: folder,
      encoding: 'utf8',
      input: 'y\n'
    }
  )

  const isiHobi = fs.readFileSync(
    path.join(folder, 'hobi.txt'),
    'utf8'
  )

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Hobi berhasil dihapus semua/)
  assert.equal(isiHobi, 'Daftar Hobi\n')
})

test('CLI hapus-semua membatalkan penghapusan setelah konfirmasi n', (t) => {
  const folder = siapkanFolder(t)
  const fileHobi = path.join(folder, 'hobi.txt')
  const isiAwal = fs.readFileSync(fileHobi, 'utf8')

  const hasil = spawnSync(
    process.execPath,
    [CLI, 'hapus-semua'],
    {
      cwd: folder,
      encoding: 'utf8',
      input: 'n\n'
    }
  )

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Penghapusan dibatalkan/)
  assert.equal(fs.readFileSync(fileHobi, 'utf8'), isiAwal)
})


test('CLI hapus-semua menerima konfirmasi huruf besar Y', (t) => {
  const folder = siapkanFolder(t)

  const hasil = spawnSync(
    process.execPath,
    [CLI, 'hapus-semua'],
    { cwd: folder, encoding: 'utf8', input: 'Y\n' }
  )

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Hobi berhasil dihapus semua/)
  assert.equal(
    fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8'),
    'Daftar Hobi\n'
  )
})

test('CLI hapus-semua membatalkan jawaban selain y dan n', (t) => {
  const folder = siapkanFolder(t)
  const fileHobi = path.join(folder, 'hobi.txt')
  const isiAwal = fs.readFileSync(fileHobi, 'utf8')

  const hasil = spawnSync(
    process.execPath,
    [CLI, 'hapus-semua'],
    { cwd: folder, encoding: 'utf8', input: 'mungkin\n' }
  )

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Penghapusan dibatalkan/)
  assert.equal(fs.readFileSync(fileHobi, 'utf8'), isiAwal)
})

test('CLI hapus-semua menghasilkan kode error jika hobi.txt tidak ada', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-hobi-'))
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }))

  const hasil = spawnSync(
    process.execPath,
    [CLI, 'hapus-semua'],
    { cwd: folder, encoding: 'utf8', input: 'y\n' }
  )

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /File hobi.txt tidak ditemukan/)
})
