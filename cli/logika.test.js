const test = require('node:test')
const assert = require('node:assert')
const { tambahHobi, hapusHobi, cariHobi, urutkanHobi, eksporHobi } = require('./logika')

test('tambahHobi menambah hobi baru', () => {
  assert.deepStrictEqual(tambahHobi(['Ngoding'], 'Membaca'), ['Ngoding', 'Membaca'])
})

test('tambahHobi menolak duplikat tanpa peduli huruf besar/kecil', () => {
  assert.throws(() => tambahHobi(['Ngoding'], 'ngoding'), /Hobi sudah ada/)
})

test('tambahHobi menolak teks kosong', () => {
  assert.throws(() => tambahHobi(['Ngoding'], ''), /tidak boleh kosong/)
})

test('tambahHobi menolak teks hanya spasi', () => {
  assert.throws(() => tambahHobi(['Ngoding'], '   '), /tidak boleh kosong/)
})

test('tambahHobi membersihkan spasi berlebih', () => {
  assert.deepStrictEqual(tambahHobi([], '  Memasak  '), ['Memasak'])
})

test('tambahHobi tidak mengubah array asli', () => {
  const asli = ['Ngoding']
  tambahHobi(asli, 'Membaca')
  assert.deepStrictEqual(asli, ['Ngoding'])
})

test('hapusHobi menghapus hobi yang ada', () => {
  assert.deepStrictEqual(hapusHobi(['Ngoding', 'Membaca'], 'membaca'), ['Ngoding'])
})

test('hapusHobi error kalau hobi tidak ada', () => {
  assert.throws(() => hapusHobi(['Ngoding'], 'Berenang'), /Hobi tidak ditemukan/)
})

test('cariHobi tidak peka huruf besar/kecil', () => {
  assert.deepStrictEqual(cariHobi(['Membaca', 'Memasak', 'Ngoding'], 'MEM'), ['Membaca', 'Memasak'])
})

test('cariHobi pada daftar kosong mengembalikan array kosong', () => {
  assert.deepStrictEqual(cariHobi([], 'a'), [])
})

test('tambahHobi menganggap spasi ganda sama dengan spasi tunggal', () => {
  assert.throws(() => tambahHobi(['Main Gitar'], 'Main   Gitar'), /Hobi sudah ada/)
})

test('cariHobi menolak teks kosong', () => {
  assert.throws(() => cariHobi(['Ngoding'], ''), /Teks pencarian tidak boleh kosong/)
})

test('urutkanHobi mengurutkan abjad tanpa mengubah array asli', () => {
  const asli = ['Ngoding', 'Membaca']
  assert.deepStrictEqual(urutkanHobi(asli), ['Membaca', 'Ngoding'])
  assert.deepStrictEqual(asli, ['Ngoding', 'Membaca'])
})

test('urutkanHobi pada daftar kosong', () => {
  assert.deepStrictEqual(urutkanHobi([]), [])
})

test('eksporHobi menghasilkan JSON yang benar', () => {
  assert.strictEqual(
    eksporHobi('Daftar Hobi', ['Membaca', 'Ngoding']),
    '{"judul":"Daftar Hobi","hobi":["Membaca","Ngoding"]}'
  )
})

test('eksporHobi pada daftar kosong', () => {
  assert.strictEqual(eksporHobi('Daftar Hobi', []), '{"judul":"Daftar Hobi","hobi":[]}')
})

test('urutkanHobi tidak peka huruf besar/kecil', () => {
  assert.deepStrictEqual(urutkanHobi(['ngoding', 'Membaca']), ['Membaca', 'ngoding'])
})

test('eksporHobi dengan satu hobi', () => {
  assert.strictEqual(eksporHobi('Daftar Hobi', ['Ngoding']), '{"judul":"Daftar Hobi","hobi":["Ngoding"]}')
})


const { hitungStatistik, gabungkanHobi } = require('./logika')

test('hitungStatistik menghitung total dan hobi unik', () => {
  assert.deepStrictEqual(
    hitungStatistik(['Ngoding', 'Membaca', 'Ngoding']),
    { total: 3, unik: 2 }
  )
})

test('hitungStatistik pada daftar kosong', () => {
  assert.deepStrictEqual(
    hitungStatistik([]),
    { total: 0, unik: 0 }
  )
})

test('gabungkanHobi menambahkan hobi baru', () => {
  assert.deepStrictEqual(
    gabungkanHobi(['Ngoding'], ['Membaca']),
    ['Ngoding', 'Membaca']
  )
})

test('gabungkanHobi mengabaikan duplikat tanpa peduli huruf besar/kecil', () => {
  assert.deepStrictEqual(
    gabungkanHobi(['Ngoding'], ['ngoding', 'Membaca']),
    ['Ngoding', 'Membaca']
  )
})

test('gabungkanHobi tidak mengubah array asli', () => {
  const asli = ['Ngoding']
  gabungkanHobi(asli, ['Membaca'])
  assert.deepStrictEqual(asli, ['Ngoding'])
})

test('gabungkanHobi menolak nama hobi kosong', () => {
  assert.throws(
    () => gabungkanHobi(['Ngoding'], ['   ']),
    /Nama hobi tidak boleh kosong/
  )
})


test('hitungStatistik menghitung satu hobi', () => {
  assert.deepStrictEqual(
    hitungStatistik(['Ngoding']),
    { total: 1, unik: 1 }
  )
})

test('hitungStatistik membedakan huruf besar dan kecil sebagai hobi yang sama', () => {
  assert.deepStrictEqual(
    hitungStatistik(['Ngoding', 'ngoding', 'Membaca']),
    { total: 3, unik: 2 }
  )
})

test('gabungkanHobi menerima tambahan kosong tanpa mengubah daftar', () => {
  assert.deepStrictEqual(
    gabungkanHobi(['Ngoding'], []),
    ['Ngoding']
  )
})

test('gabungkanHobi merapikan spasi pada hobi baru', () => {
  assert.deepStrictEqual(
    gabungkanHobi(['Ngoding'], ['  Main   Gitar  ']),
    ['Ngoding', 'Main Gitar']
  )
})
