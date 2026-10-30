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

test('hapus-kategori: menghapus kategori dari hobi yang punya kategori', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')

  const hasil = jalankan(folder, 'hapus-kategori', 'Ngoding')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /berhasil dihapus/i)

  const daftar = jalankan(folder, 'daftar-kategori', 'Teknologi')
  assert.equal(daftar.status, 1)
})

test('hapus-kategori: nama hobi tidak membedakan huruf besar dan kecil', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')

  const hasil = jalankan(folder, 'hapus-kategori', 'nGoDiNg')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Ngoding/)
})

test('hapus-kategori: menolak hobi yang tidak ditemukan', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'hapus-kategori', 'Bersepeda')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /tidak ditemukan/i)
})

test('hapus-kategori: menolak hobi yang belum punya kategori', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'hapus-kategori', 'Ngoding')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /belum memiliki kategori/i)
})

test('hapus-kategori: hobi tetap ada di hobi.txt setelah kategori dihapus', (t) => {
  const folder = siapkanFolder(t)
  const fileHobi = path.join(folder, 'hobi.txt')
  const sebelum = fs.readFileSync(fileHobi, 'utf8')

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'hapus-kategori', 'Ngoding')

  assert.equal(fs.readFileSync(fileHobi, 'utf8'), sebelum)
})

test('hapus-kategori: kategori hobi lain tidak ikut berubah', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'kategori', 'Membaca', 'Santai')

  jalankan(folder, 'hapus-kategori', 'Ngoding')

  const hasil = jalankan(folder, 'daftar-kategori', 'Santai')
  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Membaca/)
})

test('hapus-kategori: menolak jika nama hobi tidak diberikan', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'hapus-kategori')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Gunakan: node cli\/hobi\.js hapus-kategori/)
})

test('ekspor: menulis hobi ke file JSON', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'ekspor', 'hasil.json')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /berhasil diekspor/i)

  const data = JSON.parse(
    fs.readFileSync(path.join(folder, 'hasil.json'), 'utf8')
  )
  assert.deepEqual(data.hobi, ['Ngoding', 'Membaca'])
})

test('ekspor: tanpa nama file tetap menampilkan JSON ke layar', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'ekspor')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Ngoding/)
})

test('ekspor: menolak file yang bukan .json', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'ekspor', 'hasil.txt')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /\.json/)
  assert.equal(fs.existsSync(path.join(folder, 'hasil.txt')), false)
})

test('ekspor: menolak menimpa file yang sudah ada', (t) => {
  const folder = siapkanFolder(t)
  const berkas = path.join(folder, 'hasil.json')
  fs.writeFileSync(berkas, 'lama', 'utf8')

  const hasil = jalankan(folder, 'ekspor', 'hasil.json')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /--paksa/)
  assert.equal(fs.readFileSync(berkas, 'utf8'), 'lama')
})

test('ekspor: --paksa menimpa file yang sudah ada', (t) => {
  const folder = siapkanFolder(t)
  const berkas = path.join(folder, 'hasil.json')
  fs.writeFileSync(berkas, 'lama', 'utf8')

  const hasil = jalankan(folder, 'ekspor', 'hasil.json', '--paksa')

  assert.equal(hasil.status, 0)
  assert.deepEqual(JSON.parse(fs.readFileSync(berkas, 'utf8')).hobi, [
    'Ngoding',
    'Membaca'
  ])
})

test('ekspor: tidak mengubah hobi.txt', (t) => {
  const folder = siapkanFolder(t)
  const fileHobi = path.join(folder, 'hobi.txt')
  const sebelum = fs.readFileSync(fileHobi, 'utf8')

  jalankan(folder, 'ekspor', 'hasil.json')

  assert.equal(fs.readFileSync(fileHobi, 'utf8'), sebelum)
})

test('ekspor: hasil file bisa diimpor kembali', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'ekspor', 'hasil.json')

  const hasil = jalankan(folder, 'impor', 'hasil.json')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Impor berhasil. Total hobi sekarang: 2/)
})

function bacaBerkas(folder, nama) {
  return fs.readFileSync(path.join(folder, nama), 'utf8')
}

test('CLI tambah menambahkan hobi baru', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'tambah', 'Berenang')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Hobi berhasil ditambahkan/)
  assert.equal(
    bacaBerkas(folder, 'hobi.txt'),
    'Daftar Hobi\n- Ngoding\n- Membaca\n- Berenang\n'
  )
})

test('CLI hapus menghapus hobi yang ada', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'hapus', 'Ngoding')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Hobi berhasil dihapus/)
  assert.equal(bacaBerkas(folder, 'hobi.txt'), 'Daftar Hobi\n- Membaca\n')
})

test('CLI urut mengurutkan hobi secara alfabetis', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'urut')
  const isi = bacaBerkas(folder, 'hobi.txt')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Hobi berhasil diurutkan/)
  assert.ok(isi.indexOf('Membaca') < isi.indexOf('Ngoding'))
})

test('batal: membatalkan perintah tambah', (t) => {
  const folder = siapkanFolder(t)
  const awal = bacaBerkas(folder, 'hobi.txt')

  jalankan(folder, 'tambah', 'Berenang')
  assert.notEqual(bacaBerkas(folder, 'hobi.txt'), awal)

  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /berhasil dibatalkan/i)
  assert.equal(bacaBerkas(folder, 'hobi.txt'), awal)
  assert.deepEqual(
    fs.readdirSync(folder).filter(n => n.endsWith('.tmp')),
    []
  )
})

test('batal: membatalkan perintah hapus', (t) => {
  const folder = siapkanFolder(t)
  const awal = bacaBerkas(folder, 'hobi.txt')

  jalankan(folder, 'hapus', 'Ngoding')
  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(bacaBerkas(folder, 'hobi.txt'), awal)
})

test('batal: membatalkan perintah edit', (t) => {
  const folder = siapkanFolder(t)
  const awal = bacaBerkas(folder, 'hobi.txt')

  jalankan(folder, 'edit', 'Ngoding', 'Belajar Go')
  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(bacaBerkas(folder, 'hobi.txt'), awal)
})

test('batal: membatalkan kategori dan menghapus kategori.json yang baru dibuat', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  assert.equal(fs.existsSync(path.join(folder, 'kategori.json')), true)

  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(fs.existsSync(path.join(folder, 'kategori.json')), false)
})

test('batal: membatalkan hapus-kategori', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  const setelahKategori = bacaBerkas(folder, 'kategori.json')

  jalankan(folder, 'hapus-kategori', 'Ngoding')
  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(bacaBerkas(folder, 'kategori.json'), setelahKategori)
})

test('batal: membatalkan tingkat minat', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'minat', 'Ngoding', '5')
  assert.equal(fs.existsSync(path.join(folder, 'minat.json')), true)

  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(fs.existsSync(path.join(folder, 'minat.json')), false)
})

test('batal: membatalkan hapus-semua', (t) => {
  const folder = siapkanFolder(t)
  const awal = bacaBerkas(folder, 'hobi.txt')

  spawnSync(process.execPath, [CLI, 'hapus-semua'], {
    cwd: folder,
    encoding: 'utf8',
    input: 'y\n'
  })
  assert.equal(bacaBerkas(folder, 'hobi.txt'), 'Daftar Hobi\n')

  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(bacaBerkas(folder, 'hobi.txt'), awal)
})

test('batal: bisa dijalankan berulang kali, satu langkah per perintah', (t) => {
  const folder = siapkanFolder(t)
  const awal = bacaBerkas(folder, 'hobi.txt')

  jalankan(folder, 'tambah', 'Berenang')
  const setelahPertama = bacaBerkas(folder, 'hobi.txt')
  jalankan(folder, 'tambah', 'Memasak')

  jalankan(folder, 'batal')
  assert.equal(bacaBerkas(folder, 'hobi.txt'), setelahPertama)

  jalankan(folder, 'batal')
  assert.equal(bacaBerkas(folder, 'hobi.txt'), awal)
})

test('batal: gagal dengan pesan jelas jika riwayat kosong', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /Tidak ada perubahan yang bisa dibatalkan/)
})

test('batal: perintah baca-saja dan perintah gagal tidak mencatat riwayat', (t) => {
  const folder = siapkanFolder(t)

  jalankan(folder, 'daftar')
  jalankan(folder, 'statistik')
  jalankan(folder, 'cari', 'Ngo')
  jalankan(folder, 'kategori', 'Bersepeda', 'Olahraga')

  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 1)
  assert.equal(fs.existsSync(path.join(folder, '.riwayat')), false)
})

test('batal: riwayat dibatasi 10 langkah', (t) => {
  const folder = siapkanFolder(t)

  for (let i = 0; i < 12; i++) {
    const nama = `Hobi ${String.fromCharCode(65 + i)}`
    assert.equal(jalankan(folder, 'tambah', nama).status, 0)
  }

  assert.equal(fs.readdirSync(path.join(folder, '.riwayat')).length, 10)

  for (let i = 0; i < 10; i++) {
    assert.equal(jalankan(folder, 'batal').status, 0)
  }

  assert.equal(jalankan(folder, 'batal').status, 1)

  const isi = bacaBerkas(folder, 'hobi.txt')
  assert.match(isi, /Hobi A/)
  assert.match(isi, /Hobi B/)
  assert.doesNotMatch(isi, /Hobi C/)
})

function siapkanFolderV2(t, data) {
  const folder = siapkanFolder(t)
  fs.rmSync(path.join(folder, 'hobi.txt'))
  fs.writeFileSync(
    path.join(folder, 'data.json'),
    JSON.stringify(
      data || {
        judul: 'Daftar Hobi',
        hobi: ['Ngoding', 'Membaca'],
        kategori: {},
        minat: {}
      },
      null,
      2
    ) + '\n',
    'utf8'
  )
  return folder
}

function bacaDataJson(folder) {
  return JSON.parse(fs.readFileSync(path.join(folder, 'data.json'), 'utf8'))
}

test('v2: daftar membaca hobi dari data.json', (t) => {
  const folder = siapkanFolderV2(t)
  const hasil = jalankan(folder, 'daftar')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /- Ngoding/)
  assert.match(hasil.stdout, /- Membaca/)
})

test('v2: tambah menulis ke data.json dan tidak membuat hobi.txt', (t) => {
  const folder = siapkanFolderV2(t)
  const hasil = jalankan(folder, 'tambah', 'Berenang')

  assert.equal(hasil.status, 0)
  assert.deepEqual(bacaDataJson(folder).hobi, ['Ngoding', 'Membaca', 'Berenang'])
  assert.equal(fs.existsSync(path.join(folder, 'hobi.txt')), false)
})

test('v2: kategori tersimpan di data.json dan bisa dicari', (t) => {
  const folder = siapkanFolderV2(t)
  const hasil = jalankan(folder, 'kategori', 'ngoding', 'Teknologi')

  assert.equal(hasil.status, 0)
  assert.deepEqual(bacaDataJson(folder).kategori, { Ngoding: 'Teknologi' })
  assert.equal(fs.existsSync(path.join(folder, 'kategori.json')), false)

  const daftar = jalankan(folder, 'daftar-kategori', 'teknologi')
  assert.equal(daftar.status, 0)
  assert.match(daftar.stdout, /Ngoding/)
})

test('v2: minat tersimpan di data.json', (t) => {
  const folder = siapkanFolderV2(t)
  const hasil = jalankan(folder, 'minat', 'Ngoding', '4')

  assert.equal(hasil.status, 0)
  assert.deepEqual(bacaDataJson(folder).minat, { Ngoding: 4 })
  assert.equal(fs.existsSync(path.join(folder, 'minat.json')), false)
})

test('v2: menambah hobi mempertahankan kategori dan minat', (t) => {
  const folder = siapkanFolderV2(t, {
    judul: 'Daftar Hobi',
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Teknologi' },
    minat: { Ngoding: 5 }
  })

  jalankan(folder, 'tambah', 'Berenang')
  const data = bacaDataJson(folder)

  assert.deepEqual(data.kategori, { Ngoding: 'Teknologi' })
  assert.deepEqual(data.minat, { Ngoding: 5 })
})

test('v2: data.json diutamakan jika hobi.txt juga ada', (t) => {
  const folder = siapkanFolder(t)
  fs.writeFileSync(
    path.join(folder, 'data.json'),
    JSON.stringify({ judul: 'Daftar Hobi', hobi: ['Berenang'] }),
    'utf8'
  )

  const hasil = jalankan(folder, 'daftar')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Berenang/)
  assert.doesNotMatch(hasil.stdout, /Ngoding/)
})

test('v2: data.json rusak ditolak tanpa mengubah file', (t) => {
  const folder = siapkanFolder(t)
  const berkas = path.join(folder, 'data.json')
  fs.writeFileSync(berkas, '{ rusak', 'utf8')

  const hasil = jalankan(folder, 'tambah', 'Berenang')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /data\.json rusak/)
  assert.equal(fs.readFileSync(berkas, 'utf8'), '{ rusak')
})

test('v2: data.json tanpa array hobi ditolak', (t) => {
  const folder = siapkanFolder(t)
  fs.writeFileSync(
    path.join(folder, 'data.json'),
    JSON.stringify({ hobi: 'Ngoding' }),
    'utf8'
  )

  const hasil = jalankan(folder, 'daftar')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /data\.json tidak valid/)
})

test('migrasi: mengubah file lama menjadi data.json', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'minat', 'Ngoding', '5')

  const hasil = jalankan(folder, 'migrasi')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Migrasi berhasil/)
  assert.deepEqual(bacaDataJson(folder), {
    judul: 'Daftar Hobi',
    hobi: ['Ngoding', 'Membaca'],
    kategori: { Ngoding: 'Teknologi' },
    minat: { Ngoding: 5 }
  })
})

test('migrasi: menyimpan cadangan dan menghapus file lama', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  const hobiAwal = bacaBerkas(folder, 'hobi.txt')
  const kategoriAwal = bacaBerkas(folder, 'kategori.json')

  jalankan(folder, 'migrasi')

  assert.equal(bacaBerkas(folder, 'cadangan-v1/hobi.txt'), hobiAwal)
  assert.equal(bacaBerkas(folder, 'cadangan-v1/kategori.json'), kategoriAwal)
  assert.equal(fs.existsSync(path.join(folder, 'hobi.txt')), false)
  assert.equal(fs.existsSync(path.join(folder, 'kategori.json')), false)
})

test('migrasi: menolak jika data sudah memakai format v2', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'migrasi')
  const sebelum = bacaBerkas(folder, 'data.json')

  const hasil = jalankan(folder, 'migrasi')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /sudah memakai format v2/)
  assert.equal(bacaBerkas(folder, 'data.json'), sebelum)
})

test('migrasi: tanpa kategori.json dan minat.json menghasilkan objek kosong', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'migrasi')
  const data = bacaDataJson(folder)

  assert.equal(hasil.status, 0)
  assert.deepEqual(data.kategori, {})
  assert.deepEqual(data.minat, {})
})

test('migrasi: gagal jika hobi.txt tidak ada dan tidak membuat data.json', (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-hobi-'))
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }))

  const hasil = jalankan(folder, 'migrasi')

  assert.equal(hasil.status, 1)
  assert.match(hasil.stderr, /hobi\.txt tidak ditemukan/)
  assert.equal(fs.existsSync(path.join(folder, 'data.json')), false)
})

test('migrasi: kategori.json rusak menghentikan migrasi tanpa mengubah apa pun', (t) => {
  const folder = siapkanFolder(t)
  fs.writeFileSync(path.join(folder, 'kategori.json'), '{ rusak', 'utf8')

  const hasil = jalankan(folder, 'migrasi')

  assert.equal(hasil.status, 1)
  assert.equal(fs.existsSync(path.join(folder, 'data.json')), false)
  assert.equal(fs.existsSync(path.join(folder, 'cadangan-v1')), false)
  assert.equal(fs.existsSync(path.join(folder, 'hobi.txt')), true)
  assert.equal(bacaBerkas(folder, 'kategori.json'), '{ rusak')
})

test('migrasi: perintah lain tetap bekerja setelah migrasi', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'migrasi')

  const hasil = jalankan(folder, 'daftar-kategori', 'teknologi')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Ngoding/)
})

test('batal: membatalkan migrasi dan mengembalikan file lama', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  const hobiAwal = bacaBerkas(folder, 'hobi.txt')
  const kategoriAwal = bacaBerkas(folder, 'kategori.json')

  jalankan(folder, 'migrasi')
  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(fs.existsSync(path.join(folder, 'data.json')), false)
  assert.equal(bacaBerkas(folder, 'hobi.txt'), hobiAwal)
  assert.equal(bacaBerkas(folder, 'kategori.json'), kategoriAwal)
})

test('batal: membatalkan perubahan pada data.json (mode v2)', (t) => {
  const folder = siapkanFolderV2(t)
  const awal = bacaBerkas(folder, 'data.json')

  jalankan(folder, 'tambah', 'Berenang')
  assert.notEqual(bacaBerkas(folder, 'data.json'), awal)

  const hasil = jalankan(folder, 'batal')

  assert.equal(hasil.status, 0)
  assert.equal(bacaBerkas(folder, 'data.json'), awal)
})

test('info: menampilkan format v1 dan jumlah hobi', (t) => {
  const folder = siapkanFolder(t)
  const hasil = jalankan(folder, 'info')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Format penyimpanan: v1/)
  assert.match(hasil.stdout, /Jumlah hobi: 2/)
})

test('info: menghitung hobi berkategori dan berminat', (t) => {
  const folder = siapkanFolder(t)
  jalankan(folder, 'kategori', 'Ngoding', 'Teknologi')
  jalankan(folder, 'minat', 'Membaca', '3')

  const hasil = jalankan(folder, 'info')

  assert.equal(hasil.status, 0)
  assert.match(hasil.stdout, /Hobi berkategori: 1/)
  assert.match(hasil.stdout, /Hobi berminat: 1/)
})

test('info: tidak mengubah hobi.txt dan tidak mencatat riwayat', (t) => {
  const folder = siapkanFolder(t)
  const sebelum = bacaBerkas(folder, 'hobi.txt')

  jalankan(folder, 'info')

  assert.equal(bacaBerkas(folder, 'hobi.txt'), sebelum)
  assert.equal(fs.existsSync(path.join(folder, '.riwayat')), false)
})
