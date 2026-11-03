
function rapikan(teks) {
  return teks.trim().replace(/\s+/g, ' ')
}

function tambahHobi(daftar, nama) {
  const bersih = rapikan(nama)

  if (!bersih) throw new Error('Nama hobi tidak boleh kosong')

  if (daftar.some(h => h.toLowerCase() === bersih.toLowerCase())) {
    throw new Error('Hobi sudah ada')
  }

  return [...daftar, bersih]
}

function hapusHobi(daftar, nama) {
  const bersih = rapikan(nama)

  if (!bersih) throw new Error('Nama hobi tidak boleh kosong')

  const sisa = daftar.filter(
    h => h.toLowerCase() !== bersih.toLowerCase()
  )

  if (sisa.length === daftar.length) {
    throw new Error('Hobi tidak ditemukan')
  }

  return sisa
}


function editHobi(daftar, namaLama, namaBaru) {
  const lama = rapikan(namaLama)
  const baru = rapikan(namaBaru)

  if (!lama) {
    throw new Error('Nama hobi lama tidak boleh kosong')
  }

  if (!baru) {
    throw new Error('Nama hobi tidak boleh kosong')
  }

  const indeks = daftar.findIndex(
    h => h.toLowerCase() === lama.toLowerCase()
  )

  if (indeks === -1) {
    throw new Error('Hobi tidak ditemukan')
  }

  const duplikat = daftar.some(
    (h, i) => i !== indeks && h.toLowerCase() === baru.toLowerCase()
  )

  if (duplikat) {
    throw new Error('Hobi sudah ada')
  }

  return daftar.map((h, i) => i === indeks ? baru : h)
}

function cariHobi(daftar, teks) {
  const kunci = rapikan(teks).toLowerCase()

  if (!kunci) throw new Error('Teks pencarian tidak boleh kosong')

  return daftar.filter(h => h.toLowerCase().includes(kunci))
}

function urutkanHobi(daftar) {
  return [...daftar].sort((a, b) =>
    a.localeCompare(b, 'id', { sensitivity: 'base' })
  )
}

function eksporHobi(judul, daftar) {
  return JSON.stringify({ judul, hobi: daftar })
}

function hitungStatistik(daftar) {
  return {
    total: daftar.length,
    unik: new Set(daftar.map(h => h.toLowerCase())).size
  }
}

function gabungkanHobi(daftar, tambahan) {
  const hasil = [...daftar]

  for (const nama of tambahan) {
    const bersih = rapikan(nama)

    if (!bersih) {
      throw new Error('Nama hobi tidak boleh kosong')
    }

    if (!hasil.some(h => h.toLowerCase() === bersih.toLowerCase())) {
      hasil.push(bersih)
    }
  }

  return hasil
}

module.exports = {
  tambahHobi,
  hapusHobi,
  editHobi,
  cariHobi,
  urutkanHobi,
  eksporHobi,
  hitungStatistik,
  gabungkanHobi
}
