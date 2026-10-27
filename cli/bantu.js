function cariNamaHobi(daftar, nama) {
  const kunci = nama.trim().toLowerCase()
  return daftar.find(h => h.toLowerCase() === kunci)
}

module.exports = { cariNamaHobi }