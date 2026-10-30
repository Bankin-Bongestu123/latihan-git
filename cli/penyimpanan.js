const fs = require('fs')

const FILE = 'hobi.txt'
const FILE_KATEGORI = 'kategori.json'
const FILE_MINAT = 'minat.json'
const FILE_DATA = 'data.json'

function tulisAtomik(berkas, isi) {
  const sementara = `${berkas}.tmp`
  fs.writeFileSync(sementara, isi, 'utf8')
  fs.renameSync(sementara, berkas)
}

function adaV2() {
  return fs.existsSync(FILE_DATA)
}

function objekBiasa(nilai) {
  return nilai !== null && typeof nilai === 'object' && !Array.isArray(nilai)
}

function bacaData() {
  let data

  try {
    data = JSON.parse(fs.readFileSync(FILE_DATA, 'utf8'))
  } catch {
    throw new Error('data.json rusak atau tidak valid')
  }

  if (
    !objekBiasa(data) ||
    !Array.isArray(data.hobi) ||
    !data.hobi.every(h => typeof h === 'string')
  ) {
    throw new Error('data.json tidak valid: hobi harus berupa array teks')
  }

  return {
    judul: typeof data.judul === 'string' && data.judul.trim()
      ? data.judul
      : 'Daftar Hobi',
    hobi: data.hobi,
    kategori: objekBiasa(data.kategori) ? data.kategori : {},
    minat: objekBiasa(data.minat) ? data.minat : {}
  }
}

function tulisData(data) {
  tulisAtomik(FILE_DATA, JSON.stringify(data, null, 2) + '\n')
}

function baca() {
  if (adaV2()) {
    const { judul, hobi } = bacaData()
    return { judul, hobi }
  }

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
  if (adaV2()) {
    tulisData({ ...bacaData(), judul, hobi })
    return
  }

  const isi = [judul, ...hobi.map(h => `- ${h}`)].join('\n') + '\n'
  tulisAtomik(FILE, isi)
}

function bacaKategori() {
  if (adaV2()) {
    return bacaData().kategori
  }

  if (!fs.existsSync(FILE_KATEGORI)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(FILE_KATEGORI, 'utf8'))
}

function tulisKategori(data) {
  if (adaV2()) {
    tulisData({ ...bacaData(), kategori: data })
    return
  }

  tulisAtomik(FILE_KATEGORI, JSON.stringify(data, null, 2) + '\n')
}

function bacaMinat() {
  if (adaV2()) {
    return bacaData().minat
  }

  if (!fs.existsSync(FILE_MINAT)) {
    return {}
  }

  return JSON.parse(fs.readFileSync(FILE_MINAT, 'utf8'))
}

function tulisMinat(data) {
  if (adaV2()) {
    tulisData({ ...bacaData(), minat: data })
    return
  }

  tulisAtomik(FILE_MINAT, JSON.stringify(data, null, 2) + '\n')
}

module.exports = {
  FILE,
  FILE_KATEGORI,
  FILE_MINAT,
  FILE_DATA,
  tulisAtomik,
  adaV2,
  tulisData,
  baca,
  tulis,
  bacaKategori,
  tulisKategori,
  bacaMinat,
  tulisMinat
}