/**
 * Счётчик: число один раз «досчитывает» от нуля до итогового, когда
 * оказывается на экране. В разметке — итоговое значение (его видят поиск,
 * экранные читалки и посетитель без JS); при reduced-motion счёт не
 * запускается. Для клиентских <script>: элементы с data-count — итоговым
 * числом, текст элемента — итоговое значение как его показать («1000+»).
 * Пока идёт счёт, элемент держит ширину итогового значения — текст за
 * числом не сдвигается (для строчного элемента нужен display: inline-block).
 */

const SPACES = '\\s\\u00a0\\u202f'
const LEADING_DIGITS = new RegExp(`^[\\d${SPACES}]+`)

/** Промежуточные значения — в формате итогового, чтобы в конце не было
    скачка «1 000+» → «1000+»: с пробелами между разрядами, если они
    есть в итоговом, и с тем же хвостом («+») */
export function countFormatter(final: string): (n: number) => string {
  const digits = final.match(LEADING_DIGITS)?.[0] ?? ''
  const suffix = final.slice(digits.length)
  const grouped = new RegExp(`[${SPACES}]`).test(digits.trim())
  return (n) => (grouped ? n.toLocaleString('ru-RU') : String(n)) + suffix
}

/** Кривая счёта (expo-out): к середине времени — больше 95 % пути, а
    последние числа сменяются всё реже — счёт «дотягивает» до итога.
    p — доля времени 0…1 */
export const countEase = (p: number): number => (p >= 1 ? 1 : p <= 0 ? 0 : 1 - Math.pow(2, -10 * p))

/** По окончании счёта элемент получает data-counted — страница может
    отметить итог (например, короткой вспышкой числа) */
export function countUp(elements: Iterable<HTMLElement>, ms = 1400) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  const run = (el: HTMLElement, to: number, final: string) => {
    const fmt = countFormatter(final)
    let t0 = 0
    const tick = (now: number) => {
      if (!t0) t0 = now
      const p = Math.min(1, (now - t0) / ms)
      /* Округление вниз: итоговое число появляется ровно в конце, а не
         раньше времени на последних долях процента */
      el.textContent = p < 1 ? fmt(Math.floor(to * countEase(p))) : final
      if (p < 1) requestAnimationFrame(tick)
      else {
        el.style.minWidth = ''
        el.dataset.counted = ''
      }
    }
    requestAnimationFrame(tick)
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      const el = e.target as HTMLElement
      io.unobserve(el)
      run(el, Number(el.dataset.count), el.dataset.final ?? '')
    }
  }, { rootMargin: '0px 0px -10% 0px' })
  /* Сначала читаем все ширины, потом пишем: чтение после записи в том же
     кадре заставляет браузер пересчитать вёрстку заново (forced reflow) */
  const items = [...elements].filter((el) => Number.isFinite(Number(el.dataset.count)) && Number(el.dataset.count) > 0)
  const widths = items.map((el) => el.getBoundingClientRect().width)
  items.forEach((el, i) => {
    el.dataset.final = el.textContent ?? ''
    el.style.minWidth = `${widths[i]}px`
    el.textContent = countFormatter(el.dataset.final)(0)
    io.observe(el)
  })
}
