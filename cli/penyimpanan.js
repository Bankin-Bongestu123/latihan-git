const fs = require('fs')

const FILE = 'hobi.txt'
const FILE_KATEGORI = 'kategori.json'
const FILE_MINAT = 'minat.json'
const FILE_DATA = 'data.json'

const LOCK = `${FILE_DATA}.lock`
const BATAS_LOCK = 30_000
const BATAS_TUNGGU = 5_000

async function ambilKunci() {
  const mulai = Date.now()
  const token = `${process.pid}-${Date.now()}-${Math.random()}`

  while (Date.now() - mulai < BATAS_TUNGGU) {
    try {
      const fd = fs.openSync(LOCK, 'wx')
      fs.writeFileSync(fd, token, 'utf8')

      return { fd, token }
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error
      }
    }

    ambilAlihLock()

    await new Promise(resolve => setTimeout(resolve, 50))
  }

  throw new Error(
    'Gagal memperoleh lock: data.json sedang digunakan proses lain (timeout 5 detik)'
  )
}

function ambilAlihLock() {
  try {
    const status = fs.statSync(LOCK)

    if (Date.now() - status.mtimeMs <= BATAS_LOCK) {
      return false
    }

    const lockBasi = `${LOCK}.stale-${process.pid}-${Date.now()}`

    fs.renameSync(LOCK, lockBasi)
    fs.rmSync(lockBasi, { force: true })

    console.error(
      'Lock basi ditemukan (lebih dari 30 detik); mengambil alih data.json.lock'
    )

    return true
  } catch (error) {
    if (error.code === 'ENOENT') {
      return true
    }

    throw error
  }
}

function lepasKunci(kunci) {
  try {
    fs.closeSync(kunci.fd)

    if (fs.existsSync(LOCK)) {
      const pemilik = fs.readFileSync(LOCK, 'utf8')

      if (pemilik === kunci.token) {
        fs.unlinkSync(LOCK)
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

async function denganKunci(callback) {
  const kunci = await ambilKunci()

  try {
    return await callback()
  } finally {
    lepasKunci(kunci)
  }
}

function tulisAtomik(berkas, isi) {
  const sementara = `${berkas}.tmp`

  try {
    fs.writeFileSync(sementara, isi, 'utf8')
    fs.renameSync(sementara, berkas)
  } catch (error) {
    try {
      if (fs.existsSync(sementara)) {
        fs.unlinkSync(sementara)
      }
    } catch {
      // Pertahankan error asli jika proses pembersihan juga gagal.
    }

    throw error
  }
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
  bacaData,
  tulisAtomik,
  adaV2,
  tulisData,
  baca,
  tulis,
  bacaKategori,
  tulisKategori,
  bacaMinat,
  tulisMinat,
  ambilKunci,
  ambilAlihLock,
  lepasKunci,
  denganKunci
}