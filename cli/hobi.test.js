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


test('CLI edit mengganti nama hobi yang ditemukan', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'edit', 'Ngoding', 'Belajar Go')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Hobi berhasil diperbarui/)
  assert.equal(
    fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8'),
    'Daftar Hobi\n- Belajar Go\n- Membaca\n'
  )
})

test('CLI edit tidak membedakan huruf besar dan kecil pada nama lama', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'edit', 'NGODING', 'Belajar Go')

  assert.equal(hasil.status, 0)
  assert.match(
    fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8'),
    /- Belajar Go/
  )
})

test('CLI edit gagal jika hobi lama tidak ditemukan', (t) => {
  const folder = siapkanFolder(t)
  const awal = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')
  const hasil = jalankan(folder, 'edit', 'Memancing', 'Belajar Go')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Hobi tidak ditemukan/)
  assert.equal(fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8'), awal)
})

test('CLI edit menolak nama hobi baru yang kosong', (t) => {
  const folder = siapkanFolder(t)
  const awal = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')
  const hasil = jalankan(folder, 'edit', 'Ngoding', '   ')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Nama hobi tidak boleh kosong/)
  assert.equal(fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8'), awal)
})

test('CLI edit menolak nama baru yang duplikat', (t) => {
  const folder = siapkanFolder(t)
  const awal = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')
  const hasil = jalankan(folder, 'edit', 'Ngoding', 'Membaca')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Hobi sudah ada/)
  assert.equal(fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8'), awal)
})

test('CLI cari --ignore-case mencari tanpa membedakan huruf besar dan kecil', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'cari', 'NGODING', '--ignore-case')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /- Ngoding/)
})

test('CLI cari --exact hanya menampilkan nama yang sama persis', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'cari', 'Ngoding', '--exact')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /- Ngoding/)
  assert.doesNotMatch(hasil.stdout, /- Membaca/)
})

test('CLI cari menolak opsi yang tidak dikenal', (t) => {
  const folder = siapkanFolder(t)
  const awal = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')
  const hasil = jalankan(folder, 'cari', 'Go', '--unknown')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Opsi pencarian tidak dikenal/)
  assert.equal(fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8'), awal)
})


test('kategori: memberi kategori pada hobi yang ada', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /berhasil/i)

  const daftar = jalankan(folder, 'daftar-kategori', 'Teknologi')
  assert.equal(daftar.status, 0)
  assert.match(daftar.stdout, /Ngoding/)
})

test('kategori: nama hobi tidak membedakan huruf besar dan kecil', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'kategori', 'nGoDiNg', 'Teknologi')

  assert.equal(hasil.status, 0)

  const daftar = jalankan(folder, 'daftar-kategori', 'teknologi')
  assert.match(daftar.stdout, /Ngoding/)
})

test('kategori: menolak hobi yang tidak ditemukan', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'kategori', 'Bersepeda', 'Olahraga')

  assert.notEqual(hasil.status, 0)
  assert.match(hasil.stderr, /tidak ditemukan/i)
})

test('kategori: menolak kategori kosong', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'kategori', 'Ngoding', '   ')

  assert.notEqual(hasil.status, 0)
  assert.match(hasil.stderr, /kategori.*kosong/i)
})

test('daftar-kategori: menampilkan semua hobi dalam kategori', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'kategori', 'Membaca', 'Santai')

  const hasil = jalankan(folder, 'daftar-kategori', 'Santai')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Membaca/)
  assert.doesNotMatch(hasil.stdout, /Ngoding/)
})

test('daftar-kategori: pencarian kategori tidak membedakan huruf besar dan kecil', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')

  const hasil = jalankan(folder, 'daftar-kategori', 'TEKNOLOGI')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Ngoding/)
})

test('daftar-kategori: memberi pesan jika kategori belum memiliki hobi', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'daftar-kategori', 'Olahraga')

  assert.notEqual(hasil.status, 0)
  assert.match(hasil.stderr, /tidak ditemukan|belum ada/i)
})

test('kategori: input hobi tidak valid tidak mengubah daftar hobi', (t) => {
  const folder = siapkanFolder(t)
  const sebelum = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')

  jalankan(folder, 'kategori', 'Bersepeda', 'Olahraga')

  const sesudah = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')
  assert.equal(sesudah, sebelum)
})

function isiHobi(folder, ...nama) {
  fs.writeFileSync(
    path.join(folder, 'hobi.txt'),
    ['Daftar Hobi', ...nama.map(n => `- ${n}`)].join('\n') + '\n',
    'utf8'
  )
}

test('semua-kategori: menampilkan kategori beserta jumlah hobinya', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'kategori', 'Membaca', 'Santai')

  const hasil = jalankan(folder, 'semua-kategori')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Teknologi: 1 hobi/)
  assert.match(hasil.stdout, /Santai: 1 hobi/)
})

test('semua-kategori: urutan alfabetis tanpa membedakan huruf besar dan kecil', (t) => {
  const folder = siapkanFolder(t)
  isiHobi(folder, 'Ngoding', 'Membaca', 'Berenang')

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'kategori', 'Membaca', 'santai')
  jalankan(folder, 'kategori', 'Berenang', 'Olahraga')

  const hasil = jalankan(folder, 'semua-kategori')
  const keluaran = hasil.stdout

  assert.equal(hasil.status, 0)
  assert.ok(keluaran.indexOf('Olahraga') < keluaran.indexOf('santai'))
  assert.ok(keluaran.indexOf('santai') < keluaran.indexOf('Teknologi'))
})

test('semua-kategori: hobi tanpa kategori masuk Tanpa Kategori', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')

  const hasil = jalankan(folder, 'semua-kategori')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Tanpa Kategori: 1 hobi/)
  assert.match(hasil.stdout, /Teknologi: 1 hobi/)
})

test('semua-kategori: kategori beda huruf besar dan kecil digabung', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'kategori', 'Membaca', 'teknologi')

  const hasil = jalankan(folder, 'semua-kategori')
  const baris = hasil.stdout.trim().split(/\r?\n/)

  assert.equal(hasil.status, 0)
  assert.equal(baris.length, 1)
  assert.match(baris[0], /Teknologi: 2 hobi/)
})

test('semua-kategori: gagal jika belum ada hobi sama sekali', (t) => {
  const folder = siapkanFolder(t)
  isiHobi(folder)

  const hasil = jalankan(folder, 'semua-kategori')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Belum ada hobi/)
})

test('semua-kategori: tidak mengubah hobi.txt dan kategori.json', (t) => {
  const folder = siapkanFolder(t)
  const fileHobi = path.join(folder, 'hobi.txt')
  const fileKategori = path.join(folder, 'kategori.json')

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')

  const hobiSebelum = fs.readFileSync(fileHobi, 'utf8')
  const kategoriSebelum = fs.readFileSync(fileKategori, 'utf8')

  const hasil = jalankan(folder, 'semua-kategori')

  assert.equal(hasil.status, 0)
  assert.equal(fs.readFileSync(fileHobi, 'utf8'), hobiSebelum)
  assert.equal(fs.readFileSync(fileKategori, 'utf8'), kategoriSebelum)
})

test('minat: memberi tingkat minat pada hobi yang ada', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'minat', 'Ngoding', '5')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /berhasil/i)
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(folder, 'minat.json'), 'utf8')),
    { Ngoding: 5 }
  )
})

test('minat: nama hobi tidak membedakan huruf besar dan kecil', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'minat', 'nGoDiNg', '4')

  assert.equal(hasil.status, 0)
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(folder, 'minat.json'), 'utf8')),
    { Ngoding: 4 }
  )
})

test('minat: memperbarui tingkat minat yang sudah ada', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'minat', 'Ngoding', '2')
  const hasil = jalankan(folder, 'minat', 'Ngoding', '5')

  assert.equal(hasil.status, 0)
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(folder, 'minat.json'), 'utf8')),
    { Ngoding: 5 }
  )
})

test('minat: menolak hobi yang tidak ditemukan', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'minat', 'Bersepeda', '3')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /tidak ditemukan/i)
  assert.equal(fs.existsSync(path.join(folder, 'minat.json')), false)
})

for (const nilai of ['0', '6', 'abc', '3.5', '-1']) {
  test(`minat: menolak nilai tidak valid "${nilai}"`, (t) => {
    const folder = siapkanFolder(t)
    const hasil = jalankan(folder, 'minat', 'Ngoding', nilai)

    assert.equal(hasil.status, 1)
    assert.match(hasil.stderr, /1 sampai 5/)
    assert.equal(fs.existsSync(path.join(folder, 'minat.json')), false)
  })
}

test('urut-minat: mengurutkan dari minat tertinggi', (t) => {
  const folder = siapkanFolder(t)
  isiHobi(folder, 'Ngoding', 'Membaca', 'Berenang')
  jalankan(folder, 'minat', 'Ngoding', '2')
  jalankan(folder, 'minat', 'Membaca', '5')

  const hasil = jalankan(folder, 'urut-minat')
  const keluaran = hasil.stdout

  assert.equal(hasil.status, 0)
  assert.ok(keluaran.indexOf('Membaca') < keluaran.indexOf('Ngoding'))
  assert.ok(keluaran.indexOf('Ngoding') < keluaran.indexOf('Berenang'))
})

test('urut-minat: hobi tanpa minat ditandai dan berada di akhir', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'minat', 'Ngoding', '3')

  const hasil = jalankan(folder, 'urut-minat')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Ngoding \(minat: 3\)/)
  assert.match(hasil.stdout, /Membaca \(belum ada minat\)/)
})

test('urut-minat: gagal jika belum ada hobi', (t) => {
  const folder = siapkanFolder(t)
  isiHobi(folder)

  const hasil = jalankan(folder, 'urut-minat')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Belum ada hobi/)
})
