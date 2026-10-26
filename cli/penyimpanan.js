const fs = require('fs')

const FILE = 'hobi.txt'
const FILE_KATEGORI = 'kategori.json'
const FILE_MINAT = 'minat.json'

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

module.exports = {
  baca,
  tulis,
  bacaKategori,
  tulisKategori,
  bacaMinat,
  tulisMinat
}