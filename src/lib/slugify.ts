const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

/** Транслитерация кириллицы + кебаб-кейс, для читаемых URL (например, моделей дверей). */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .split('')
    .map(char => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Слаг модели = транслитерация имени + слаг серии. При коллизии (две модели
 * дают одинаковый слаг) к обеим добавляется короткий суффикс из id — иначе
 * вторая модель тихо перекрыла бы первую в роутинге.
 * Используется и в lib/model-entries.ts (роутинг /models/[id] и URL в товарном
 * фиде), и в lib/catalog-data.ts (ссылки каталога) — чтобы слаги не разошлись,
 * импортируй именно эту функцию во всех местах.
 */
export function buildModelSlugMap(
  models: { id: string; name: string; seriesSlug: string }[],
): Map<string, string> {
  const baseSlugOf = new Map<string, string>()
  const baseSlugCounts = new Map<string, number>()

  for (const m of models) {
    const base = [slugify(m.name), m.seriesSlug].filter(Boolean).join('-')
    baseSlugOf.set(m.id, base)
    baseSlugCounts.set(base, (baseSlugCounts.get(base) ?? 0) + 1)
  }

  const slugMap = new Map<string, string>()
  for (const m of models) {
    const base = baseSlugOf.get(m.id)!
    slugMap.set(m.id, (baseSlugCounts.get(base) ?? 0) > 1 ? `${base}-${m.id.slice(0, 6)}` : base)
  }

  return slugMap
}
