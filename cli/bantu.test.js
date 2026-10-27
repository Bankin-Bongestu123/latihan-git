const test = require('node:test')
const assert = require('node:assert/strict')
const { cariNamaHobi } = require('./bantu')

const daftar = ['Ngoding', 'Membaca']

test('cariNamaHobi: tidak membedakan huruf besar dan kecil', () => {
  assert.equal(cariNamaHobi(daftar, 'nGoDiNg'), 'Ngoding')
})

test('cariNamaHobi: mengabaikan spasi di awal dan akhir', () => {
  assert.equal(cariNamaHobi(daftar, '  membaca  '), 'Membaca')
})

test('cariNamaHobi: mengembalikan undefined jika tidak ditemukan', () => {
  assert.equal(cariNamaHobi(daftar, 'Bersepeda'), undefined)
})