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

export function countUp(elements: Iterable<HTMLElement>, ms = 1400) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
  const run = (el: HTMLElement, to: number, final: string) => {
    const fmt = countFormatter(final)
    let t0 = 0
    const tick = (now: number) => {
      if (!t0) t0 = now
      const p = Math.min(1, (now - t0) / ms)
      /* ease-out: быстро в начале, плавно подходит к итогу */
      el.textContent = p < 1 ? fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))) : final
      if (p < 1) requestAnimationFrame(tick)
      else el.style.minWidth = ''
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
  for (const el of elements) {
    const to = Number(el.dataset.count)
    if (!Number.isFinite(to) || to <= 0) continue
    el.dataset.final = el.textContent ?? ''
    el.style.minWidth = `${el.getBoundingClientRect().width}px`
    el.textContent = countFormatter(el.dataset.final)(0)
    io.observe(el)
  }
}
