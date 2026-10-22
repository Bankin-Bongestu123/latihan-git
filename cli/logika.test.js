const test = require('node:test')
const assert = require('node:assert')
const { tambahHobi, hapusHobi, cariHobi } = require('./logika')

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