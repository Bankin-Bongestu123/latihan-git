
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { buatServer } = require('./serve')

test('HTTP API menjalankan seluruh pengujian', async (t) => {
  const folder = fs.mkdtempSync(
    path.join(os.tmpdir(), 'tes-serve-api-')
  )
  const folderAwal = process.cwd()
  const server = buatServer()

  process.chdir(folder)

  function resetData() {
    fs.writeFileSync(
      'hobi.txt',
      'Daftar Hobi\n- Ngoding\n- Membaca\n- Olahraga\n'
    )

    for (const file of [
      'kategori.json',
      'minat.json',
      'data.json',
      'data.json.lock'
    ]) {
      fs.rmSync(file, { force: true })
    }
  }

  resetData()

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  const alamat = `http://127.0.0.1:${server.address().port}`

  t.after(async () => {
    await new Promise(resolve => server.close(resolve))
    process.chdir(folderAwal)
    fs.rmSync(folder, { recursive: true, force: true })
  })

  async function kirim(method, url, body, contentType = 'application/json') {
    const options = { method }

    if (body !== undefined) {
      options.headers = { 'Content-Type': contentType }
      options.body = body
    }

    return fetch(`${alamat}${url}`, options)
  }

  async function json(response) {
    return response.json()
  }

  await t.test('1. GET /hobi mengembalikan status 200', async () => {
    resetData()
    const response = await kirim('GET', '/hobi')
    assert.equal(response.status, 200)
  })

  await t.test('2. GET /hobi mengembalikan data yang benar', async () => {
    resetData()
    const response = await kirim('GET', '/hobi')
    const data = await json(response)

    assert.equal(data.judul, 'Daftar Hobi')
    assert.deepEqual(data.hobi, ['Ngoding', 'Membaca', 'Olahraga'])
  })

  await t.test('3. GET tetap bekerja dengan query string', async () => {
    resetData()
    const response = await kirim('GET', '/hobi?format=json')
    assert.equal(response.status, 200)
  })

  await t.test('4. POST berhasil menambahkan hobi', async () => {
    resetData()
    const response = await kirim(
      'POST',
      '/hobi',
      JSON.stringify({ nama: 'Bersepeda' })
    )

    assert.equal(response.status, 201)
  })

  await t.test('5. POST menyimpan hobi ke penyimpanan', async () => {
    resetData()
    await kirim('POST', '/hobi', JSON.stringify({ nama: 'Bersepeda' }))

    const response = await kirim('GET', '/hobi')
    const data = await json(response)

    assert.ok(data.hobi.includes('Bersepeda'))
  })

  await t.test('6. POST menolak hobi duplikat dengan 409', async () => {
    resetData()
    const response = await kirim(
      'POST',
      '/hobi',
      JSON.stringify({ nama: 'Ngoding' })
    )

    assert.equal(response.status, 409)
  })

  await t.test('7. POST menolak nama kosong dengan 400', async () => {
    resetData()
    const response = await kirim(
      'POST',
      '/hobi',
      JSON.stringify({ nama: '   ' })
    )

    assert.equal(response.status, 400)
  })

  await t.test('8. POST menolak JSON rusak dengan 400', async () => {
    resetData()
    const response = await kirim('POST', '/hobi', '{json-rusak')

    assert.equal(response.status, 400)
  })

  await t.test('9. POST menolak Content-Type selain JSON', async () => {
  resetData()

  const response = await kirim(
    'POST',
    '/hobi',
    '{"nama":"Bersepeda"}',
    'text/plain'
  )

  assert.equal(response.status, 400)
})

await t.test('POST menolak request tanpa Content-Type', async () => {
  resetData()

const response = await fetch(`${alamat}/hobi`, {
        method: 'POST',
    body: JSON.stringify({ nama: 'Bersepeda' }),
  })

  assert.equal(response.status, 400)
})

  await t.test('10. POST menolak body berupa array', async () => {
    resetData()
    const response = await kirim('POST', '/hobi', '[]')

    assert.equal(response.status, 400)
  })

  await t.test('11. POST menolak body berupa null', async () => {
    resetData()
    const response = await kirim('POST', '/hobi', 'null')

    assert.equal(response.status, 400)
  })

  await t.test('12. DELETE berhasil menghapus hobi', async () => {
    resetData()
    const response = await kirim('DELETE', '/hobi/Ngoding')

    assert.equal(response.status, 200)
  })

  await t.test('13. DELETE benar-benar menghapus data hobi', async () => {
    resetData()
    await kirim('DELETE', '/hobi/Ngoding')

    const response = await kirim('GET', '/hobi')
    const data = await json(response)

    assert.ok(!data.hobi.includes('Ngoding'))
  })

  await t.test('14. DELETE hobi yang tidak ada menghasilkan 404', async () => {
    resetData()
    const response = await kirim('DELETE', '/hobi/TidakAda')

    assert.equal(response.status, 404)
  })

  await t.test('15. DELETE ikut membersihkan kategori dan minat', async () => {
    resetData()

    await kirim(
      'PUT',
      '/hobi/Ngoding/kategori',
      JSON.stringify({ kategori: 'Teknologi' })
    )

    await kirim(
      'PUT',
      '/hobi/Ngoding/minat',
      JSON.stringify({ minat: 5 })
    )

    await kirim('DELETE', '/hobi/Ngoding')

    const response = await kirim('GET', '/hobi')
    const data = await json(response)

    assert.deepEqual(data.kategori, {})
    assert.deepEqual(data.minat, {})
  })

  await t.test('16. DELETE mendukung nama dengan spasi', async () => {
    resetData()

    await kirim(
      'POST',
      '/hobi',
      JSON.stringify({ nama: 'Main Game' })
    )

    const response = await kirim('DELETE', '/hobi/Main%20Game')

    assert.equal(response.status, 200)
  })

  await t.test('17. DELETE menolak encoding URL yang rusak', async () => {
    resetData()
    const response = await kirim('DELETE', '/hobi/%ZZ')

    assert.equal(response.status, 400)
  })

  await t.test('18. PUT kategori berhasil mengubah kategori', async () => {
    resetData()
    const response = await kirim(
      'PUT',
      '/hobi/Ngoding/kategori',
      JSON.stringify({ kategori: 'Teknologi' })
    )

    assert.equal(response.status, 200)
  })

  await t.test('19. PUT kategori menyimpan perubahan', async () => {
    resetData()

    await kirim(
      'PUT',
      '/hobi/Ngoding/kategori',
      JSON.stringify({ kategori: 'Teknologi' })
    )

    const response = await kirim('GET', '/hobi')
    const data = await json(response)

    assert.equal(data.kategori.Ngoding, 'Teknologi')
  })

  await t.test('20. PUT kategori menolak nilai kosong', async () => {
    resetData()
    const response = await kirim(
      'PUT',
      '/hobi/Ngoding/kategori',
      JSON.stringify({ kategori: ' ' })
    )

    assert.equal(response.status, 400)
  })

  await t.test('21. PUT kategori menolak hobi yang tidak ada', async () => {
    resetData()
    const response = await kirim(
      'PUT',
      '/hobi/TidakAda/kategori',
      JSON.stringify({ kategori: 'Teknologi' })
    )

    assert.equal(response.status, 404)
  })

  await t.test('22. PUT minat berhasil mengubah tingkat minat', async () => {
    resetData()
    const response = await kirim(
      'PUT',
      '/hobi/Ngoding/minat',
      JSON.stringify({ minat: 5 })
    )

    assert.equal(response.status, 200)
  })

  await t.test('23. PUT minat menyimpan perubahan', async () => {
    resetData()

    await kirim(
      'PUT',
      '/hobi/Ngoding/minat',
      JSON.stringify({ minat: 5 })
    )

    const response = await kirim('GET', '/hobi')
    const data = await json(response)

    assert.equal(data.minat.Ngoding, 5)
  })

  await t.test('24. PUT minat menolak angka di bawah 1', async () => {
    resetData()
    const response = await kirim(
      'PUT',
      '/hobi/Ngoding/minat',
      JSON.stringify({ minat: 0 })
    )

    assert.equal(response.status, 400)
  })

  await t.test('25. PUT minat menolak angka di atas 5', async () => {
    resetData()
    const response = await kirim(
      'PUT',
      '/hobi/Ngoding/minat',
      JSON.stringify({ minat: 6 })
    )

    assert.equal(response.status, 400)
  })

  await t.test('26. PUT minat menolak nilai berupa teks', async () => {
    resetData()
    const response = await kirim(
      'PUT',
      '/hobi/Ngoding/minat',
      JSON.stringify({ minat: '5' })
    )

    assert.equal(response.status, 400)
  })

  await t.test('27. Server menolak body lebih dari 100 KB', async () => {
    resetData()

    const body = JSON.stringify({
      nama: 'A'.repeat(102400)
    })

    const response = await kirim('POST', '/hobi', body)

    assert.equal(response.status, 413)
  })

  await t.test('28. Endpoint yang tidak dikenal menghasilkan 404', async () => {
    resetData()
    const response = await kirim('GET', '/alamat-tidak-ada')

    assert.equal(response.status, 404)
  })

  await t.test('29. Method yang tidak didukung menghasilkan 404', async () => {
    resetData()
    const response = await kirim('PATCH', '/hobi')

    assert.equal(response.status, 404)
  })
})
