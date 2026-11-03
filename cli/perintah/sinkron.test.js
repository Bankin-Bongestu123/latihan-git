const test = require('node:test')
const assert = require('node:assert/strict')

const {
  gabungkanTigaArah,
  jalankan,
  simpanHasilAtomik
} = require('./sinkron')

const kasus = [
  {
    nama: 'tidak ada perubahan',
    basis: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    hasil: ['Ngoding']
  },
  {
    nama: 'hobi baru dari lokal',
    basis: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lokal: { hobi: ['Ngoding', 'Membaca'], kategori: {}, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    hasil: ['Ngoding', 'Membaca']
  },
  {
    nama: 'hobi baru dari file lain',
    basis: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lain: { hobi: ['Ngoding', 'Olahraga'], kategori: {}, minat: {} },
    hasil: ['Ngoding', 'Olahraga']
  },
  {
    nama: 'hobi baru dari kedua sisi',
    basis: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lokal: { hobi: ['Ngoding', 'Membaca'], kategori: {}, minat: {} },
    lain: { hobi: ['Ngoding', 'Olahraga'], kategori: {}, minat: {} },
    hasil: ['Ngoding', 'Membaca', 'Olahraga']
  },
  {
    nama: 'penghapusan lokal diterapkan',
    basis: { hobi: ['Ngoding', 'Membaca'], kategori: {}, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lain: { hobi: ['Ngoding', 'Membaca'], kategori: {}, minat: {} },
    hasil: ['Ngoding']
  },
  {
    nama: 'penghapusan dari file lain diterapkan',
    basis: { hobi: ['Ngoding', 'Membaca'], kategori: {}, minat: {} },
    lokal: { hobi: ['Ngoding', 'Membaca'], kategori: {}, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    hasil: ['Ngoding']
  },
  {
    nama: 'penghapusan dari kedua sisi',
    basis: { hobi: ['Ngoding', 'Membaca'], kategori: {}, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: {}, minat: {} },
    hasil: ['Ngoding']
  },
  {
    nama: 'perubahan kategori lokal',
    basis: { hobi: ['Ngoding'], kategori: { Ngoding: 'Umum' }, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: { Ngoding: 'Teknologi' }, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: { Ngoding: 'Umum' }, minat: {} },
    hasil: ['Ngoding'],
    kategori: { Ngoding: 'Teknologi' }
  },
  {
    nama: 'perubahan kategori dari file lain',
    basis: { hobi: ['Ngoding'], kategori: { Ngoding: 'Umum' }, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: { Ngoding: 'Umum' }, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: { Ngoding: 'Teknologi' }, minat: {} },
    hasil: ['Ngoding'],
    kategori: { Ngoding: 'Teknologi' }
  },
  {
    nama: 'perubahan kategori sama di kedua sisi',
    basis: { hobi: ['Ngoding'], kategori: { Ngoding: 'Umum' }, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: { Ngoding: 'Teknologi' }, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: { Ngoding: 'Teknologi' }, minat: {} },
    hasil: ['Ngoding'],
    kategori: { Ngoding: 'Teknologi' }
  },
  {
    nama: 'konflik kategori',
    basis: { hobi: ['Ngoding'], kategori: { Ngoding: 'Umum' }, minat: {} },
    lokal: { hobi: ['Ngoding'], kategori: { Ngoding: 'Teknologi' }, minat: {} },
    lain: { hobi: ['Ngoding'], kategori: { Ngoding: 'Pendidikan' }, minat: {} },
    error: /Konflik perubahan/
  },
  {
    nama: 'perubahan minat lokal',
    basis: { hobi: ['Ngoding'], kategori: {}, minat: { Ngoding: 3 } },
    lokal: { hobi: ['Ngoding'], kategori: {}, minat: { Ngoding: 5 } },
    lain: { hobi: ['Ngoding'], kategori: {}, minat: { Ngoding: 3 } },
    hasil: ['Ngoding'],
    minat: { Ngoding: 5 }
  },
  {
    nama: 'konflik minat',
    basis: { hobi: ['Ngoding'], kategori: {}, minat: { Ngoding: 3 } },
    lokal: { hobi: ['Ngoding'], kategori: {}, minat: { Ngoding: 4 } },
    lain: { hobi: ['Ngoding'], kategori: {}, minat: { Ngoding: 5 } },
    error: /Konflik perubahan/
  },
  {
    nama: 'perubahan kategori dan minat pada hobi berbeda',
    basis: {
      hobi: ['Ngoding', 'Membaca'],
      kategori: {},
      minat: {}
    },
    lokal: {
      hobi: ['Ngoding', 'Membaca'],
      kategori: { Ngoding: 'Teknologi' },
      minat: {}
    },
    lain: {
      hobi: ['Ngoding', 'Membaca'],
      kategori: {},
      minat: { Membaca: 5 }
    },
    hasil: ['Ngoding', 'Membaca'],
    kategori: { Ngoding: 'Teknologi' },
    minat: { Membaca: 5 }
  },
  {
    nama: 'metadata hobi yang dihapus ikut dibersihkan',
    basis: {
      hobi: ['Ngoding', 'Membaca'],
      kategori: { Membaca: 'Literasi' },
      minat: { Membaca: 4 }
    },
    lokal: {
      hobi: ['Ngoding'],
      kategori: {},
      minat: {}
    },
    lain: {
      hobi: ['Ngoding', 'Membaca'],
      kategori: { Membaca: 'Literasi' },
      minat: { Membaca: 4 }
    },
    hasil: ['Ngoding'],
    kategori: {},
    minat: {}
  }
]

for (const kasusUji of kasus) {
  test(`gabungkanTigaArah: ${kasusUji.nama}`, () => {
    if (kasusUji.error) {
      assert.throws(
        () => gabungkanTigaArah(
          kasusUji.basis,
          kasusUji.lokal,
          kasusUji.lain
        ),
        kasusUji.error
      )
      return
    }

    const hasil = gabungkanTigaArah(
      kasusUji.basis,
      kasusUji.lokal,
      kasusUji.lain
    )

    assert.deepEqual(hasil.hobi, kasusUji.hasil)

    if (kasusUji.kategori) {
      assert.deepEqual(hasil.kategori, kasusUji.kategori)
    }

    if (kasusUji.minat) {
      assert.deepEqual(hasil.minat, kasusUji.minat)
    }
  })
}

test('pilih lokal menyelesaikan konflik kategori', () => {
  const basis = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Umum' },
    minat: {}
  }

  const lokal = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Teknologi' },
    minat: {}
  }

  const lain = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Pendidikan' },
    minat: {}
  }

  const hasil = gabungkanTigaArah(
    basis,
    lokal,
    lain,
    'lokal'
  )

  assert.equal(hasil.kategori.Ngoding, 'Teknologi')
})

test('pilih lain menyelesaikan konflik kategori', () => {
  const basis = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Umum' },
    minat: {}
  }

  const lokal = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Teknologi' },
    minat: {}
  }

  const lain = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Pendidikan' },
    minat: {}
  }

  const hasil = gabungkanTigaArah(
    basis,
    lokal,
    lain,
    'lain'
  )

  assert.equal(hasil.kategori.Ngoding, 'Pendidikan')
})

test('sinkron menolak jika snapshot basis tidak ditemukan', (t) => {
  const fs = require('node:fs')
  const os = require('node:os')
  const path = require('node:path')

  const folder = fs.mkdtempSync(
    path.join(os.tmpdir(), 'tes-sinkron-')
  )

  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  assert.throws(
    () => jalankan({ sisa: ['data-lain.json'] }),
    /Snapshot basis tidak ditemukan/
  )
})

test('konflik sinkron tidak mengubah data lokal dan snapshot basis', (t) => {
  const fs = require('node:fs')
  const os = require('node:os')
  const path = require('node:path')

  const folder = fs.mkdtempSync(
    path.join(os.tmpdir(), 'tes-sinkron-konflik-')
  )

  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  const basis = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Umum' },
    minat: {}
  }

  const lokal = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Teknologi' },
    minat: {}
  }

  const lain = {
    hobi: ['Ngoding'],
    kategori: { Ngoding: 'Pendidikan' },
    minat: {}
  }

  fs.writeFileSync(
    '.sinkron-basis.json',
    JSON.stringify(basis, null, 2)
  )

  fs.writeFileSync(
    'data.json',
    JSON.stringify(lokal, null, 2)
  )

  fs.writeFileSync(
    'data-lain.json',
    JSON.stringify(lain, null, 2)
  )

  const dataSebelum = fs.readFileSync('data.json', 'utf8')
  const basisSebelum = fs.readFileSync('.sinkron-basis.json', 'utf8')

  assert.throws(
    () => jalankan({ sisa: ['data-lain.json'] }),
    /Konflik perubahan/
  )

  assert.equal(
    fs.readFileSync('data.json', 'utf8'),
    dataSebelum
  )

  assert.equal(
    fs.readFileSync('.sinkron-basis.json', 'utf8'),
    basisSebelum
  )
})

test('simpanHasilAtomik memulihkan data jika penyimpanan snapshot gagal', (t) => {
  const fs = require('node:fs')
  const os = require('node:os')
  const path = require('node:path')

  const folder = fs.mkdtempSync(
    path.join(os.tmpdir(), 'tes-sinkron-rollback-')
  )

  const folderAwal = process.cwd()
  const tulisFileAsli = fs.writeFileSync
  let sudahGagal = false

  t.after(() => {
    fs.writeFileSync = tulisFileAsli
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  const dataAwal = JSON.stringify({
    hobi: ['Ngoding'],
    kategori: {},
    minat: {}
  }, null, 2)

  const basisAwal = JSON.stringify({
    hobi: ['Ngoding'],
    kategori: {},
    minat: {}
  }, null, 2)

  fs.writeFileSync('data.json', dataAwal)
  fs.writeFileSync('.sinkron-basis.json', basisAwal)

  fs.writeFileSync = (berkas, ...args) => {
    if (
      berkas === '.sinkron-basis.json.tmp' &&
      !sudahGagal
    ) {
      sudahGagal = true
      throw new Error('Simulasi kegagalan penyimpanan')
    }

    return tulisFileAsli(berkas, ...args)
  }

  assert.throws(
    () => simpanHasilAtomik({
      hobi: ['Ngoding', 'Membaca'],
      kategori: {},
      minat: {}
    }),
    /Simulasi kegagalan penyimpanan/
  )

  assert.equal(
    fs.readFileSync('data.json', 'utf8'),
    dataAwal
  )

  assert.equal(
    fs.readFileSync('.sinkron-basis.json', 'utf8'),
    basisAwal
  )
})