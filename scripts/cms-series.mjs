/**
 * Список серий для Strapi («Для поисковиков и каталога» → «Серии
 * каталога»): серии с моделями из Supabase → значения списка в
 * cms/src/components/article/catalog-series.json. Запускать, когда в
 * каталоге появилась или исчезла серия (сборка об этом предупредит);
 * Strapi в разработке перезапустится сам.
 *   npm run cms:series
 */
import { readFile, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

process.loadEnvFile('.env')
const FILE = new URL('../cms/src/components/article/catalog-series.json', import.meta.url)

const sb = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_ANON_KEY)
const { data, error } = await sb.from('model_colors').select('models(series(slug))')
if (error) throw new Error(`Supabase: ${error.message}`)
const slugs = [...new Set(data.map((r) => r.models?.series?.slug).filter(Boolean))].sort()

const schema = JSON.parse(await readFile(FILE, 'utf8'))
const before = schema.attributes.series.enum
schema.attributes.series.enum = slugs
await writeFile(FILE, JSON.stringify(schema, null, 2) + '\n')

const added = slugs.filter((s) => !before.includes(s))
const removed = before.filter((s) => !slugs.includes(s))
console.log(`Серий: ${slugs.length}${added.length ? `; добавлены: ${added.join(', ')}` : ''}${removed.length ? `; убраны: ${removed.join(', ')}` : ''}`)
if (removed.length) console.log('Статьи с убранными сериями: сборка назовёт их — выберите другую серию в Strapi.')
