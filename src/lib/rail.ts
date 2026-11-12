/* Ленты карточек (.rail, src/styles/home.css): полоска прогресса, стрелки на компьютере; на
   телефоне лента листается пальцем. Разметка — .rail[data-rail] > [data-track] + RailBar.
   Повторный вызов безопасен: лента подключается один раз. */
export function initRails(root: ParentNode = document) {
  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')
  const desktop = matchMedia('(hover: hover) and (min-width: 43.75rem)')
  for (const rail of root.querySelectorAll<HTMLElement>('[data-rail]')) {
    if ('railBound' in rail.dataset) continue
    rail.dataset.railBound = ''
    const track = rail.querySelector<HTMLElement>('[data-track]')!
    const thumb = rail.querySelector<HTMLElement>('.rail__line i')!
    const prev = rail.querySelector<HTMLButtonElement>('[data-prev]')!
    const next = rail.querySelector<HTMLButtonElement>('[data-next]')!
    /* Компьютер: ширина колонки подгоняется так, чтобы в ленту влезало целое
       число карточек (базовая ширина — из CSS, ±15 %), крайняя не обрезана.
       Только для ленты-сетки колонками; ленты с карточками разной ширины
       (flex) и раскрытая сетка (grid-auto-flow: row) не трогаем */
    const fit = () => {
      track.style.removeProperty('--rail-fit')
      const cs = getComputedStyle(track)
      if (cs.display === 'flex') return justify()
      const first = track.firstElementChild as HTMLElement | null
      if (!desktop.matches || !first || cs.display !== 'grid' || !cs.gridAutoFlow.startsWith('column')) return
      const gap = parseFloat(cs.columnGap) || 0
      const base = first.getBoundingClientRect().width
      const width = track.clientWidth
      if (!base || !width) return
      const n = Math.max(1, Math.round((width + gap) / (base + gap)))
      track.style.setProperty('--rail-fit', `${(width - (n - 1) * gap) / n}px`)
    }
    /* Лента из кадров разной ширины (flex, у каждого <li> пропорция --ar):
       на компьютере — ряды одной высоты, каждый ряд ровно по ширине ленты
       (выровненная галерея). Ни один кадр не обрезан краем, листать не нужно.
       Высота ряда — около исходной высоты ленты; последний неполный ряд не
       растягивается. Телефон — прежняя лента пальцем */
    const justify = () => {
      const items = [...track.children] as HTMLElement[]
      track.style.removeProperty('flex-wrap')
      track.style.removeProperty('row-gap')
      for (const li of items) li.style.removeProperty('width')
      if (!desktop.matches || !items.length) return
      const ratios = items.map((li) => parseFloat(getComputedStyle(li).getPropertyValue('--ar')))
      if (ratios.some((r) => !(r > 0))) return
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      const width = track.clientWidth
      const base = items[0]!.getBoundingClientRect().width / ratios[0]!
      if (!base || !width) return
      const rows: number[][] = []
      let row: number[] = []
      let sum = 0
      ratios.forEach((r, i) => {
        /* Добавляем кадр, пока ряд на исходной высоте не шире ленты; если с ним
           ряд ближе к ширине ленты, чем без него, — берём и закрываем ряд */
        const without = sum * base + (row.length - 1) * gap
        const withIt = (sum + r) * base + row.length * gap
        if (row.length && withIt > width && Math.abs(width - without) < Math.abs(withIt - width)) {
          rows.push(row); row = []; sum = 0
        }
        row.push(i); sum += r
        if ((sum * base + (row.length - 1) * gap) >= width) { rows.push(row); row = []; sum = 0 }
      })
      if (row.length) rows.push(row)
      let prev = base
      rows.forEach((idx, n) => {
        const total = idx.reduce((a, i) => a + ratios[i]!, 0)
        const full = (width - (idx.length - 1) * gap) / total
        /* Последний ряд, которому не хватает кадров до ширины ленты, не
           растягивается: высота — как у ряда над ним (или исходная) */
        const h = n === rows.length - 1 && full > prev ? prev : full
        prev = h
        for (const i of idx) items[i]!.style.width = `${Math.floor(ratios[i]! * h * 100) / 100}px`
      })
      track.style.flexWrap = 'wrap'
      track.style.rowGap = `${gap * 1.5}px`
    }
    /* Стрелки — на середине фото первой карточки (или ленты, если фото нет) */
    const place = () => {
      const media = track.querySelector<HTMLElement>('li :is(img, video, svg, .h-media)')
      const top = rail.getBoundingClientRect().top
      const box = (media ?? track).getBoundingClientRect()
      rail.style.setProperty('--rail-mid', `${Math.round(box.top - top + box.height / 2)}px`)
    }
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
    /* Шаг стрелки — на страницу целых карточек (ширина ленты + промежуток),
       без подгонки — на 85 % ширины */
    const step = () => {
      const fitted = track.style.getPropertyValue('--rail-fit')
      return fitted ? track.clientWidth + (parseFloat(getComputedStyle(track).columnGap) || 0) : track.clientWidth * 0.85
    }
    let lastWidth = -1
    const resized = () => {
      /* Подгонка меняет ширину карточек, но не ширину ленты — пересчёт только
         при смене ширины, иначе ResizeObserver гонял бы сам себя */
      if (track.clientWidth !== lastWidth) { lastWidth = track.clientWidth; fit() }
      place()
      update()
    }
    track.addEventListener('scroll', update, { passive: true })
    new ResizeObserver(resized).observe(track)
    desktop.addEventListener('change', () => { lastWidth = -1; resized() })
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: smooth() }))
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: smooth() }))
    resized()
  }
}
