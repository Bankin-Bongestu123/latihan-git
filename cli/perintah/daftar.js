function jalankan({ hobi, jsonAktif }) {
  if (jsonAktif) {
    return hobi
  }

  hobi.forEach(h => console.log(`- ${h}`))
}

module.exports = { jalankan }