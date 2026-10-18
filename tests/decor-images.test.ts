import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { IMAGES, REYKI_IMAGES } from '../src/data/decor-products'

test('фото «Декора» — копии в проекте: каждый файл из srcset и крупный кадр лежат в public/', () => {
  for (const img of [...Object.values(IMAGES), ...REYKI_IMAGES]) {
    const files = [img.src, img.large, ...img.srcset.split(', ').map((s) => s.split(' ')[0]!)]
    for (const f of files) {
      assert.match(f, /^\/renders\/decor\//, `${f} — не локальная копия`)
      assert.ok(existsSync(`public${f}`), `нет файла public${f}`)
    }
    assert.ok(img.width > 0 && img.height > 0)
  }
})
