/**
 * Согласие на cookie Яндекс Метрики (152-ФЗ): Метрика загружается только
 * после «Принять». Выбор хранится в localStorage браузера посетителя —
 * версия текста согласия, выбор, дата. Поменялся текст согласия
 * (src/pages/consent.astro) — поднимите CONSENT_VERSION, и баннер спросит
 * заново: старое согласие давалось на другие условия.
 */

export const CONSENT_KEY = 'cookie-consent-v'
/** Прежняя запись «1» — баннер с одной кнопкой, без отказа: согласием не считается */
export const LEGACY_CONSENT_KEY = 'cookie-consent'
export const CONSENT_VERSION = 1
/** Кнопка «Настройки cookie» в подвале снова открывает баннер */
export const CONSENT_SETTINGS_EVENT = 'cookie-settings'

export type ConsentChoice = 'accepted' | 'declined'

/** Сохранённый выбор; нет записи, старая версия или мусор — null (спросить) */
export function readConsent(raw: string | null): ConsentChoice | null {
  if (!raw) return null
  try {
    const rec = JSON.parse(raw)
    if (rec?.v !== CONSENT_VERSION) return null
    return rec.choice === 'accepted' || rec.choice === 'declined' ? rec.choice : null
  } catch {
    return null
  }
}

export const writeConsent = (choice: ConsentChoice, at = new Date()): string =>
  JSON.stringify({ v: CONSENT_VERSION, choice, at: at.toISOString() })

/** Cookie и записи localStorage Метрики: _ym_uid, _ym_d, _ym<счётчик>_… */
export const metrikaKeys = (names: string[]): string[] => names.filter((n) => n.startsWith('_ym'))

/** Домены, на которых Метрика могла поставить cookie: сам хост и родители без зоны;
    '' — cookie без domain (только этот хост) */
export function cookieDomains(host: string): string[] {
  const parts = host.split('.')
  const domains = ['']
  for (let i = 0; i < parts.length - 1; i++) {
    const d = parts.slice(i).join('.')
    domains.push(d, `.${d}`)
  }
  return domains
}
