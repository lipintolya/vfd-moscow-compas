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

test('robots.txt: Clean-param — только в группе Яндекса, Googlebot её не видит (иначе предупреждение в Search Console)', async () => {
  const text = await (await (GET as unknown as () => Response)()).text()
  const [general, yandex] = text.split('User-agent: Yandex')
  assert.ok(yandex, 'нет группы User-agent: Yandex')
  assert.doesNotMatch(general!, /Clean-param/)
  assert.match(yandex, /^Clean-param: /m)
})
