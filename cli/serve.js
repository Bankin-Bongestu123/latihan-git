const http = require('node:http')

const {
  baca,
  bacaKategori,
  bacaMinat,
  denganKunci,
  tulis,
  tulisKategori,
  tulisMinat
} = require('./penyimpanan')

const { ambilKeadaan, catatPerubahan } = require('./riwayat')
const { tambahHobi, hapusHobi } = require('./logika')
const { cariNamaHobi } = require('./bantu')

// Batas maksimal ukuran body request adalah 100 KB.
const BATAS_BODY = 100 * 1024

function buatError(pesan, statusCode) {
  const error = new Error(pesan)
  error.statusCode = statusCode
  return error
}

function balas(res, status, data) {
  res.writeHead(status)
  res.end(JSON.stringify(data))
}

async function bacaBody(req) {
  const contentType = (req.headers['content-type'] || '')
    .split(';')[0]
    .trim()
    .toLowerCase()

  if (contentType !== 'application/json') {
    req.resume()
    throw buatError('Content-Type harus application/json', 400)
  }

  return new Promise((resolve, reject) => {
    const potongan = []
    let ukuran = 0
    let selesai = false

    req.on('data', bagian => {
      if (selesai) return

      ukuran += bagian.length

      if (ukuran > BATAS_BODY) {
        selesai = true
        reject(buatError('Ukuran body maksimal 100 KB', 413))
        req.resume()
        return
      }

      potongan.push(bagian)
    })

    req.on('end', () => {
      if (selesai) return

      try {
        const isi = Buffer.concat(potongan).toString('utf8')
        const body = JSON.parse(isi)

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          throw buatError('Body harus berupa object JSON', 400)
        }

        selesai = true
        resolve(body)
      } catch (error) {
        selesai = true
        reject(error.statusCode ? error : buatError('JSON tidak valid', 400))
      }
    })

    req.on('error', error => {
      if (selesai) return

      selesai = true
      reject(error)
    })
  })
}

function ambilSegmen(url) {
  let pathname

  try {
    pathname = new URL(url, 'http://127.0.0.1').pathname
  } catch {
    throw buatError('URL tidak valid', 400)
  }

  try {
    return pathname.split('/').map(segmen => decodeURIComponent(segmen))
  } catch {
    throw buatError('Encoding URL tidak valid', 400)
  }
}

function validasiNama(nama) {
  if (!nama || !nama.trim() || nama.includes('/')) {
    throw buatError('Nama hobi tidak valid', 400)
  }

  return nama
}

function statusKesalahan(error) {
  if (error.statusCode) return error.statusCode
  if (error.message === 'Hobi sudah ada') return 409
  if (error.message === 'Hobi tidak ditemukan') return 404
  return 400
}

async function tanganiRequest(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  try {
    const segmen = ambilSegmen(req.url)

    // GET /hobi
    if (req.method === 'GET' &&
        segmen.length === 2 &&
        segmen[1] === 'hobi') {
      const { judul, hobi } = baca()

      return balas(res, 200, {
        judul,
        hobi,
        kategori: bacaKategori(),
        minat: bacaMinat()
      })
    }

    // POST /hobi
    if (req.method === 'POST' &&
        segmen.length === 2 &&
        segmen[1] === 'hobi') {
      const body = await bacaBody(req)

      await denganKunci(async () => {
        const { judul, hobi } = baca()
        const sebelum = ambilKeadaan()
        const hobiBaru = tambahHobi(hobi, body.nama)

        tulis(judul, hobiBaru)
        catatPerubahan(sebelum)
      })

      return balas(res, 201, {
        pesan: 'Hobi berhasil ditambahkan'
      })
    }

        // DELETE /hobi/:nama
    if (req.method === 'DELETE' &&
        segmen.length === 3 &&
        segmen[1] === 'hobi') {
      const nama = validasiNama(segmen[2])

      await denganKunci(async () => {
        const { judul, hobi } = baca()
        const ditemukan = cariNamaHobi(hobi, nama)

        if (!ditemukan) {
          throw buatError('Hobi tidak ditemukan', 404)
        }

        const sebelum = ambilKeadaan()
        const hobiBaru = hapusHobi(hobi, nama)

        const kategori = bacaKategori()
        const minat = bacaMinat()

        delete kategori[ditemukan]
        delete minat[ditemukan]

        tulis(judul, hobiBaru)
        tulisKategori(kategori)
        tulisMinat(minat)

        catatPerubahan(sebelum)
      })

      return balas(res, 200, {
        pesan: 'Hobi berhasil dihapus'
      })
    }

    // PUT /hobi/:nama/kategori
    if (req.method === 'PUT' &&
        segmen.length === 4 &&
        segmen[1] === 'hobi' &&
        segmen[3] === 'kategori') {
      const nama = validasiNama(segmen[2])
      const body = await bacaBody(req)

      if (typeof body.kategori !== 'string' || !body.kategori.trim()) {
        throw buatError('Nama kategori tidak boleh kosong', 400)
      }

      await denganKunci(async () => {
        const { hobi } = baca()
        const ditemukan = cariNamaHobi(hobi, nama)

        if (!ditemukan) {
          throw buatError('Hobi tidak ditemukan', 404)
        }

        const sebelum = ambilKeadaan()
        const kategori = bacaKategori()
        kategori[ditemukan] = body.kategori.trim()

        tulisKategori(kategori)
        catatPerubahan(sebelum)
      })

      return balas(res, 200, {
        pesan: 'Kategori hobi berhasil diperbarui'
      })
    }

    // PUT /hobi/:nama/minat
    if (req.method === 'PUT' &&
        segmen.length === 4 &&
        segmen[1] === 'hobi' &&
        segmen[3] === 'minat') {
      const nama = validasiNama(segmen[2])
      const body = await bacaBody(req)

      if (!Number.isInteger(body.minat) ||
          body.minat < 1 ||
          body.minat > 5) {
        throw buatError('Tingkat minat harus angka 1 sampai 5', 400)
      }

      await denganKunci(async () => {
        const { hobi } = baca()
        const ditemukan = cariNamaHobi(hobi, nama)

        if (!ditemukan) {
          throw buatError('Hobi tidak ditemukan', 404)
        }

        const sebelum = ambilKeadaan()
        const minat = bacaMinat()
        minat[ditemukan] = body.minat

        tulisMinat(minat)
        catatPerubahan(sebelum)
      })

      return balas(res, 200, {
        pesan: 'Minat hobi berhasil diperbarui'
      })
    }

    return balas(res, 404, {
      error: 'Endpoint tidak ditemukan'
    })
  } catch (error) {
    const status = statusKesalahan(error)

    return balas(res, status, {
      error: error.message
    })
  }
}

function buatServer() {
  return http.createServer(tanganiRequest)
}

function jalankanServer(argumen) {
  let port = 3000

  if (argumen.length > 0) {
    if (argumen.length !== 2 || argumen[0] !== '--port') {
      throw new Error('Penggunaan: serve [--port 3000]')
    }

    port = Number(argumen[1])

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Port harus berupa angka antara 1 sampai 65535')
    }
  }

  const server = buatServer()

  return new Promise((resolve, reject) => {
    server.once('error', reject)

    server.listen(port, '127.0.0.1', () => {
      console.log(`Server berjalan di http://127.0.0.1:${port}`)
    })

    const hentikanServer = () => {
      console.log('\nMenghentikan server...')

      server.close(() => {
        console.log('Server berhasil dihentikan')
        process.removeListener('SIGINT', hentikanServer)
        resolve()
      })
    }

    process.once('SIGINT', hentikanServer)
  })
}

module.exports = { buatServer, jalankanServer }