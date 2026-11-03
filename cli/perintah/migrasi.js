const fs = require('fs')
const path = require('path')
const {
  FILE,
  FILE_KATEGORI,
  FILE_MINAT,
  adaV2,
  bacaKategori,
  bacaMinat,
  tulisData,
  tulisAtomik
} = require('../penyimpanan')

const FOLDER_CADANGAN = 'cadangan-v1'
const FILE_BASIS = '.sinkron-basis.json'

function jalankan({ judul, hobi }) {
  if (adaV2()) {
    throw new Error('Data sudah memakai format v2 (data.json)')
  }

  const kategori = bacaKategori()
  const minat = bacaMinat()

  fs.mkdirSync(FOLDER_CADANGAN, { recursive: true })

  const lama = [FILE, FILE_KATEGORI, FILE_MINAT].filter(n => fs.existsSync(n))
  lama.forEach(n => fs.copyFileSync(n, path.join(FOLDER_CADANGAN, n)))

  tulisData({ judul, hobi, kategori, minat })
  const dataMigrasi = {
  judul,
  hobi,
  kategori,
  minat
}

tulisData(dataMigrasi)

tulisAtomik(
  FILE_BASIS,
  JSON.stringify(dataMigrasi, null, 2) + '\n'
)



  lama.forEach(n => fs.rmSync(n))

  console.log(`Migrasi berhasil. Cadangan format lama ada di folder ${FOLDER_CADANGAN}`)
}

module.exports = { jalankan }