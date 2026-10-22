import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GET } from '../src/pages/robots.txt'
import { SITE } from '../src/config/site'

test('robots.txt: ничего не закрыто Disallow — служебные страницы закрываются только noindex', async () => {
  const text = await (await (GET as unknown as () => Response)()).text()
  // Disallow не даёт Google увидеть noindex — страница попадает в индекс пустой
  assert.doesNotMatch(text, /^Disallow:/m)
  assert.match(text, new RegExp(`^Sitemap: ${SITE.url}/sitemap-index\\.xml$`, 'm'))
})
