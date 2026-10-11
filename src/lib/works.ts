/**
 * Работы портфолио для страниц — из коллекции works (Strapi, раздел
 * «Портфолио»), новые сверху. Один источник для главной, /portfolio/,
 * страницы работы и разделов каталога.
 */
import { getCollection } from 'astro:content'
import type { PortfolioWork } from '../data/portfolio-works'

export async function getWorks(): Promise<PortfolioWork[]> {
  return (await getCollection('works')).map((e) => e.data).sort((a, b) => b.date.localeCompare(a.date))
}
