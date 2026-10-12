/**
 * Перенос статьи из Markdoc (.mdoc) в поля и блоки Strapi (разовый).
 * Текст → блоки Strapi Blocks, теги → компоненты article.*, переменные
 * {% $salon.address %} → подстановки {адрес салона}. Фото и ролики —
 * { $media: '/путь/на/сайте' }: их загружает cms/scripts/import-articles.mjs.
 * Неизвестный тег или переменная — ошибка с адресом статьи: ничего не
 * должно потеряться молча.
 */
import Markdoc from '@markdoc/markdoc'
import yaml from 'js-yaml'
import { SUBSTITUTION_BY_PATH } from '../../src/data/article-substitutions.ts'

const COATING = { pet: 'ПЭТ', emal: 'Эмаль', emalex: 'Эмалекс', protach: 'Протач', ekoshpon: 'Экошпон' }
const CALLOUT = { tip: 'Совет', info: 'Важно', warning: 'Обратите внимание' }
const TEXT_NODES = new Set(['heading', 'paragraph', 'list', 'blockquote'])

const media = (path) => (path ? { $media: path } : null)
const orNull = (v) => (v === undefined || v === '' ? null : v)
const isoDate = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d) : null)

export function mdocToArticle(source, slug) {
  const fail = (msg) => { throw new Error(`${slug}: ${msg}`) }
  const subName = (path) => SUBSTITUTION_BY_PATH[path] ?? fail(`нет подстановки для $${path}`)
  /* {% $путь %} в строке шапки → {имя} */
  const fillLine = (s) => (s == null ? s : String(s).replace(/\{%\s*\$([\w.]+)\s*%\}/g, (_, p) => `{${subName(p)}}`))

  /* Инлайн Markdoc → листья Strapi Blocks */
  const inline = (nodes, marks = {}) => nodes.flatMap((n) => {
    switch (n.type) {
      case 'inline': return inline(n.children, marks)
      case 'text': {
        const c = n.attributes.content
        const text = typeof c === 'string' ? c : Array.isArray(c?.path) ? `{${subName(c.path.join('.'))}}` : fail(`непонятный текст ${JSON.stringify(c)}`)
        return text === '' ? [] : [{ type: 'text', text, ...marks }]
      }
      case 'strong': return inline(n.children, { ...marks, bold: true })
      case 'em': return inline(n.children, { ...marks, italic: true })
      case 'code': return [{ type: 'text', text: n.attributes.content, ...marks, code: true }]
      case 'link': return [{ type: 'link', url: n.attributes.href, children: inline(n.children, marks) }]
      case 'softbreak': case 'hardbreak': return [{ type: 'text', text: ' ', ...marks }]
      default: return fail(`в тексте непереносимый элемент «${n.type}»`)
    }
  })
  const textNode = (n) => {
    switch (n.type) {
      case 'heading': return { type: 'heading', level: n.attributes.level, children: inline(n.children) }
      case 'paragraph': return { type: 'paragraph', children: inline(n.children) }
      case 'list': return {
        type: 'list', format: n.attributes.ordered ? 'ordered' : 'unordered',
        children: n.children.map((item) => ({ type: 'list-item', children: inline(item.children.flatMap((c) => (c.type === 'paragraph' ? c.children : [c]))) })),
      }
      case 'blockquote': return { type: 'quote', children: inline(n.children.flatMap((c) => c.children)) }
      default: return fail(`непереносимый элемент «${n.type}»`)
    }
  }
  const cellText = (cell) => inline(cell.children).map((l) => l.text).join('').trim()
  const rows = (node, type) => (node.type === type ? [node] : (node.children ?? []).flatMap((c) => rows(c, type)))

  const tagBlock = (n) => {
    const a = n.attributes
    switch (n.tag) {
      case 'figure': return {
        __component: 'article.photo', image: media(a.src), alt: a.alt ?? '', caption: orNull(a.caption),
        layout: a.narrow ? 'Узкое (схема)' : a.natural ? 'Без обрезки' : 'Во всю колонку',
      }
      case 'photogrid': return {
        __component: 'article.gallery', columns: a.cols ?? null, doors: Boolean(a.doors),
        photos: n.children.filter((c) => c.type === 'tag').map((p) => {
          if (p.tag !== 'photo') fail(`в {% photogrid %} тег {% ${p.tag} %}`)
          return { image: media(p.attributes.src), alt: orNull(p.attributes.alt), caption: orNull(p.attributes.caption), link: orNull(p.attributes.href) }
        }),
      }
      case 'callout': return {
        __component: 'article.callout', kind: CALLOUT[a.type ?? 'tip'] ?? fail(`выноска type=${a.type}`), title: orNull(a.title),
        text: n.children.map(textNode),
      }
      case 'video': return {
        __component: 'article.video', video: media(a.src), poster: media(a.poster), title: a.title, caption: orNull(a.caption), narrow: Boolean(a.narrow),
      }
      case 'table': {
        const head = rows(n, 'thead').flatMap((h) => rows(h, 'tr'))
        const body = rows(n, 'tbody').flatMap((b) => rows(b, 'tr'))
        const line = (tr) => `| ${tr.children.map(cellText).join(' | ')} |`
        if (head.length !== 1) fail('таблица без строки заголовков')
        return { __component: 'article.table', markdown: [line(head[0]), `|${head[0].children.map(() => '---').join('|')}|`, ...body.map(line)].join('\n') }
      }
      case 'hiddenHeightPrices': return { __component: 'article.hidden-prices', note: null }
      case 'coatingPrices': return { __component: 'article.coating-prices', note: null }
      default: return fail(`тег {% ${n.tag} %} не переносится`)
    }
  }

  const ast = Markdoc.parse(source)
  const fm = yaml.load(ast.attributes.frontmatter ?? '') ?? {}
  const body = []
  let text = null
  for (const n of ast.children) {
    if (TEXT_NODES.has(n.type)) {
      if (!text) body.push(text = { __component: 'article.text', content: [] })
      text.content.push(textNode(n))
    } else if (n.type === 'tag') {
      text = null
      body.push(tagBlock(n))
    } else if (n.type !== 'hr') {
      fail(`непереносимый элемент «${n.type}»`)
    }
  }

  const items = (list) => (list ?? []).map((t) => ({ text: fillLine(t) }))
  const sp = fm.spotlight
  return {
    slug,
    title: fm.title,
    kind: fm.kind === 'publication' ? 'Публикация' : 'Статья',
    publishDate: isoDate(fm.publishDate),
    updatedDate: isoDate(fm.updatedDate),
    cover: media(fm.coverImage),
    coverAlt: fm.coverImageAlt ?? '',
    description: fillLine(fm.description),
    summary: items(fm.summary),
    keywords: items(fm.keywords),
    faq: (fm.faq ?? []).map((f) => ({ q: fillLine(f.q), a: fillLine(f.a) })),
    body,
    seo: {
      metaTitle: orNull(fm.metaTitle),
      steps: (fm.steps ?? []).map((s) => ({ name: s.name, text: s.text })),
      coatings: (fm.relatedCoatings ?? []).map((c) => ({ coating: COATING[c] ?? fail(`покрытие ${c}`) })),
      series: items(fm.relatedSeriesSlugs),
      pages: items(fm.relatedPages),
      author: fm.author ? {
        name: fm.author.name, role: fm.author.role, href: fm.author.href, photo: media(fm.author.photo),
        linkLabel: orNull(fm.author.linkLabel), type: fm.author.type === 'person' ? 'Человек' : 'Организация',
      } : null,
      spotlight: sp ? {
        label: sp.label, lead: orNull(sp.lead), image: media(sp.image), imageAlt: sp.imageAlt,
        video: media(sp.video), poster: media(sp.poster), videoTitle: orNull(sp.videoTitle), points: items(sp.points),
      } : null,
    },
  }
}
