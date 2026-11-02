const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawn } = require('node:child_process')

const penyimpanan = require('./penyimpanan')

test('lock dibuat secara eksklusif dan dilepas setelah selesai', async (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-lock-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })
  fs.writeFileSync(path.join(folder, 'hobi.txt'), '')

  process.chdir(folder)

  await penyimpanan.denganKunci(async () => {
    assert.equal(fs.existsSync('data.json.lock'), true)

    await assert.rejects(
      penyimpanan.ambilKunci(),
      /timeout 5 detik/
    )
  })

  assert.equal(fs.existsSync('data.json.lock'), false)
})

test('lock tetap dilepas ketika proses mengalami error', async (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-lock-error-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  await assert.rejects(
    penyimpanan.denganKunci(() => {
      throw new Error('Simulasi kegagalan')
    }),
    /Simulasi kegagalan/
  )

  assert.equal(fs.existsSync('data.json.lock'), false)
})

test('lock basi lebih dari 30 detik dapat diambil alih', async (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-lock-stale-'))
  const folderAwal = process.cwd()

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  process.chdir(folder)

  fs.writeFileSync('data.json.lock', 'lock-lama')

  const waktuLama = new Date(Date.now() - 31_000)
  fs.utimesSync('data.json.lock', waktuLama, waktuLama)

  await penyimpanan.denganKunci(async () => {
    assert.equal(fs.existsSync('data.json.lock'), true)
  })

  assert.equal(fs.existsSync('data.json.lock'), false)
})

test('8 proses tambah bersamaan menyimpan semua hobi', async (t) => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tes-lock-paralel-'))
  const folderAwal = process.cwd()
  const cliPath = path.resolve(folderAwal, 'cli', 'hobi.js')
  fs.writeFileSync(path.join(folder, 'hobi.txt'), '')

  t.after(() => {
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  const jalankan = (nomor) =>
    new Promise((resolve, reject) => {
      const proses = spawn(process.execPath, [
        cliPath,
        'tambah',
        `Hobi ${nomor}`
      ], { cwd: folder })

      let stderr = ''

      proses.stderr.on('data', data => {
        stderr += data.toString()
      })

      proses.on('error', reject)

      proses.on('close', kode => {
        if (kode === 0) {
          resolve()
        } else {
          reject(new Error(`Proses ${nomor} gagal: ${stderr}`))
        }
      })
    })

  await Promise.all(
    Array.from({ length: 8 }, (_, i) => jalankan(i + 1))
  )

  const hasil = fs.readFileSync(path.join(folder, 'hobi.txt'), 'utf8')

  for (let i = 1; i <= 8; i++) {
    assert.match(hasil, new RegExp(`Hobi ${i}`))
  }
})