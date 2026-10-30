const fs = require('fs')

const FILE = 'hobi.txt'
const FILE_KATEGORI = 'kategori.json'
const FILE_MINAT = 'minat.json'

function tulisAtomik(berkas, isi) {
  const sementara = `${berkas}.tmp`
  fs.writeFileSync(sementara, isi, 'utf8')
  fs.renameSync(sementara, berkas)
}

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
  tulisAtomik(FILE, isi)
}

function bacaKategori() {
  if (!fs.existsSync(FILE_KATEGORI)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(FILE_KATEGORI, 'utf8'))
}

function tulisKategori(data) {
  tulisAtomik(FILE_KATEGORI, JSON.stringify(data, null, 2) + '\n')
}

function bacaMinat() {
  if (!fs.existsSync(FILE_MINAT)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(FILE_MINAT, 'utf8'))
}

function tulisMinat(data) {
  tulisAtomik(FILE_MINAT, JSON.stringify(data, null, 2) + '\n')
}

module.exports = {
  FILE,
  FILE_KATEGORI,
  FILE_MINAT,
  tulisAtomik,
  baca,
  tulis,
  bacaKategori,
  tulisKategori,
  bacaMinat,
  tulisMinat
}