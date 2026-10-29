const { pulihkanTerakhir } = require('../riwayat')

function jalankan() {
  pulihkanTerakhir()
  console.log('Perubahan terakhir berhasil dibatalkan')
}

module.exports = { jalankan }