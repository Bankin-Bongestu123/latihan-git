function tambahHobi(daftar, nama) {
  const bersih = nama.trim()
  if (!bersih) throw new Error('Nama hobi tidak boleh kosong')
  if (daftar.some(h => h.toLowerCase() === bersih.toLowerCase()))
    throw new Error('Hobi sudah ada')
  return [...daftar, bersih]
}

function hapusHobi(daftar, nama) {
  const bersih = nama.trim()
  if (!bersih) throw new Error('Nama hobi tidak boleh kosong')
  const sisa = daftar.filter(h => h.toLowerCase() !== bersih.toLowerCase())
  if (sisa.length === daftar.length) throw new Error('Hobi tidak ditemukan')
  return sisa
}

function cariHobi(daftar, teks) {
  const kunci = teks.trim().toLowerCase()
  return daftar.filter(h => h.toLowerCase().includes(kunci))
}

module.exports = { tambahHobi, hapusHobi, cariHobi }