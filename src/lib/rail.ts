/* Ленты карточек (.rail, src/styles/home.css): полоска прогресса, стрелки на компьютере; на
   телефоне лента листается пальцем. Разметка — .rail[data-rail] > [data-track] + RailBar.
   Повторный вызов безопасен: лента подключается один раз. */
export function initRails(root: ParentNode = document) {
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')
  for (const rail of root.querySelectorAll<HTMLElement>('[data-rail]')) {
    if ('railBound' in rail.dataset) continue
    rail.dataset.railBound = ''
    const track = rail.querySelector<HTMLElement>('[data-track]')!
    const thumb = rail.querySelector<HTMLElement>('.rail__line i')!
    const prev = rail.querySelector<HTMLButtonElement>('[data-prev]')!
    const next = rail.querySelector<HTMLButtonElement>('[data-next]')!
    const update = () => {
      const max = track.scrollWidth - track.clientWidth
      const share = max > 1 ? track.clientWidth / track.scrollWidth : 1
      const at = max > 1 ? track.scrollLeft / max : 0
      thumb.style.width = `${share * 100}%`
      thumb.style.left = `${at * (1 - share) * 100}%`
      rail.toggleAttribute('data-static', max <= 1)
      prev.disabled = track.scrollLeft <= 1
      next.disabled = track.scrollLeft >= max - 1
    }
    track.addEventListener('scroll', update, { passive: true })
    new ResizeObserver(update).observe(track)
    prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.85, behavior: smooth() }))
    next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.85, behavior: smooth() }))
    update()
  }
}
