/**
 * Тело статьи из Strapi (dynamic zone body) → блоки для ArticleBlocks.astro.
 * Текст (Strapi Blocks) — готовый HTML: подстановки {…} заполнены, разметка
 * из текста экранирована, у заголовков якоря как у прежнего Markdoc
 * (github-slugger, один на статью). Попутно — оглавление (headings) и текст
 * для «мин чтения» (как раньше: без подписей к фото и подстановок).
 */
import Slugger from 'github-slugger'
import { fillSubstitutions, stripSubstitutions } from './article-substitutions'
import { strapiImage, type SiteImage, type StrapiMedia } from './strapi'

interface Leaf { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }
interface Link { type: 'link'; url: string; children: Leaf[] }
type Inline = Leaf | Link
export type RichNode =
  | { type: 'paragraph' | 'quote' | 'code'; children: Inline[] }
  | { type: 'heading'; level: number; children: Inline[] }
  | ListNode
  | { type: 'image'; image: StrapiMedia; children?: Inline[] }

/** Список; вложенный (Tab в редакторе) лежит среди пунктов родителя */
interface ListNode { type: 'list'; format: 'ordered' | 'unordered'; children: ({ type: 'list-item'; children: Inline[] } | ListNode)[] }

export interface Heading { depth: number; slug: string; text: string }

type Opt = string | null | undefined
export type StrapiBlock =
  | { __component: 'article.text'; content: RichNode[] }
  | { __component: 'article.photo'; image: StrapiMedia; alt?: Opt; caption?: Opt; layout?: Opt }
  | { __component: 'article.gallery'; photos: { image: StrapiMedia; alt?: Opt; caption?: Opt; link?: Opt }[]; columns?: number | null; doors?: boolean | null }
  | { __component: 'article.callout'; kind?: Opt; title?: Opt; text: RichNode[] }
  | { __component: 'article.video'; video: StrapiMedia; poster: StrapiMedia; title: string; caption?: Opt; narrow?: boolean | null }
  | { __component: 'article.table'; markdown: string }
  | { __component: 'article.hidden-prices' }
  | { __component: 'article.coating-prices' }

export type SiteBlock =
  | { type: 'text'; html: string }
  | { type: 'photo'; image: SiteImage; zoom: string; caption?: string; layout: 'column' | 'narrow' | 'natural' }
  | { type: 'gallery'; photos: { image: SiteImage; zoom: string; caption?: string; href?: string }[]; columns?: number; doors: boolean }
  | { type: 'callout'; kind: 'tip' | 'info' | 'warning'; title?: string; html: string }
  | { type: 'video'; src: string; poster: string; title: string; caption?: string; narrow: boolean }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'hiddenPrices' }
  | { type: 'coatingPrices' }

/** Значения полей Strapi (по-русски) → значения сайта */
export const CALLOUT_KIND: Record<string, 'tip' | 'info' | 'warning'> = { 'Совет': 'tip', 'Важно': 'info', 'Обратите внимание': 'warning' }
export const PHOTO_LAYOUT: Record<string, 'column' | 'narrow' | 'natural'> = { 'Во всю колонку': 'column', 'Узкое (схема)': 'narrow', 'Без обрезки': 'natural' }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const opt = (v: Opt) => v || undefined

/** Ссылка из Strapi: только страницы сайта, http(s), почта, телефон, якорь.
    javascript:, data: и прочее — ошибка сборки (иначе код на странице) */
export function safeUrl(url: string, where: string): string {
  const u = url.trim()
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(u)) return u
  throw new Error(`${where}: недопустимая ссылка «${u.slice(0, 60)}» — нужен адрес страницы сайта (/catalog/…) или https://…`)
}

class TextRenderer {
  words: string[] = []
  headings: Heading[] = []
  constructor(private slugger: Slugger, private where: string) {}

  private leaf(l: Leaf): string {
    this.words.push(stripSubstitutions(l.text))
    let html = esc(fillSubstitutions(l.text, this.where))
    if (l.code) html = `<code>${html}</code>`
    if (l.bold) html = `<strong>${html}</strong>`
    if (l.italic) html = `<em>${html}</em>`
    if (l.underline) html = `<u>${html}</u>`
    if (l.strikethrough) html = `<s>${html}</s>`
    return html
  }
  private inline(nodes: Inline[]): string {
    return nodes.map((n) => {
      if (n.type !== 'link') return this.leaf(n)
      const html = `<a href="${esc(safeUrl(n.url, this.where))}">${n.children.map((c) => this.leaf(c)).join('')}</a>`
      this.words.push(n.url)
      return html
    }).join('')
  }
  private plain(nodes: Inline[]): string {
    return nodes.map((n) => (n.type === 'link' ? n.children.map((c) => c.text).join('') : n.text)).join('')
  }
  /** Вложенный список дописывается в предыдущий пункт */
  private list(n: ListNode): string {
    const tag = n.format === 'ordered' ? 'ol' : 'ul'
    const items: string[] = []
    for (const child of n.children) {
      if (child.type === 'list') {
        if (items.length) items[items.length - 1] += this.list(child)
        else items.push(this.list(child))
      } else {
        items.push(this.inline(child.children))
      }
    }
    return `<${tag}>${items.map((i) => `<li>${i}</li>`).join('')}</${tag}>`
  }

  render(nodes: RichNode[]): string {
    return nodes.map((n) => {
      switch (n.type) {
        case 'paragraph':
          return this.plain(n.children).trim() ? `<p>${this.inline(n.children)}</p>` : ''
        case 'heading': {
          const text = fillSubstitutions(this.plain(n.children), this.where)
          const slug = this.slugger.slug(text)
          this.headings.push({ depth: n.level, slug, text })
          return `<h${n.level} id="${esc(slug)}">${this.inline(n.children)}</h${n.level}>`
        }
        case 'list':
          return this.list(n)
        case 'quote':
          return `<blockquote><p>${this.inline(n.children)}</p></blockquote>`
        case 'code':
          return `<pre><code>${esc(this.plain(n.children))}</code></pre>`
        case 'image': {
          const img = strapiImage(n.image, 1280)
          const set = img.srcset ? ` srcset="${esc(img.srcset)}" sizes="(min-width: 1312px) 1280px, calc(100vw - 32px)"` : ''
          return `<p><img src="${esc(img.src)}"${set} alt="${esc(img.alt)}" loading="lazy" decoding="async"></p>`
        }
        default:
          throw new Error(`${this.where}: в тексте неизвестный элемент «${(n as { type: string }).type}»`)
      }
    }).join('')
  }
}

function parseTable(markdown: string, where: string, words: string[]): { head: string[]; rows: string[][] } {
  const lines = markdown.split('\n').map((l) => l.trim()).filter(Boolean)
  const cells = (line: string) => line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  if (lines.length < 2 || !/^\|?\s*:?-{3,}/.test(lines[1]!)) {
    throw new Error(`${where}: таблица — первая строка с заголовками, вторая |---|---|, дальше строки`)
  }
  const fill = (row: string[]) => row.map((c) => { words.push(stripSubstitutions(c)); return esc(fillSubstitutions(c, where)) })
  return { head: fill(cells(lines[0]!)), rows: lines.slice(2).map((l) => fill(cells(l))) }
}

const photo = (media: StrapiMedia, alt: string) => ({ image: { ...strapiImage(media, 1280), alt }, zoom: strapiImage(media, 1920).src })

export function toSiteBlocks(raw: StrapiBlock[], where: string): { blocks: SiteBlock[]; headings: Heading[]; text: string } {
  const text = new TextRenderer(new Slugger(), where)
  const blocks = raw.map((b): SiteBlock => {
    switch (b.__component) {
      case 'article.text':
        return { type: 'text', html: text.render(b.content) }
      case 'article.photo':
        return { type: 'photo', ...photo(b.image, b.alt || b.image.alternativeText || ''), caption: opt(b.caption), layout: PHOTO_LAYOUT[b.layout ?? ''] ?? 'column' }
      case 'article.gallery':
        return {
          type: 'gallery',
          photos: b.photos.map((p) => ({ ...photo(p.image, p.alt || p.image.alternativeText || p.caption || ''), caption: opt(p.caption), href: p.link ? safeUrl(p.link, where) : undefined })),
          columns: b.columns ?? undefined,
          doors: Boolean(b.doors),
        }
      case 'article.callout':
        return { type: 'callout', kind: CALLOUT_KIND[b.kind ?? ''] ?? 'tip', title: opt(b.title), html: text.render(b.text) }
      case 'article.video':
        return { type: 'video', src: b.video.url, poster: strapiImage(b.poster, 960).src, title: b.title, caption: opt(b.caption), narrow: Boolean(b.narrow) }
      case 'article.table':
        return { type: 'table', ...parseTable(b.markdown, where, text.words) }
      case 'article.hidden-prices':
        return { type: 'hiddenPrices' }
      case 'article.coating-prices':
        return { type: 'coatingPrices' }
      default:
        throw new Error(`${where}: неизвестный блок «${(b as { __component: string }).__component}»`)
    }
  })
  return { blocks, headings: text.headings, text: text.words.join(' ') }
}
