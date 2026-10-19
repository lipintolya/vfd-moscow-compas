/**
 * Ссылка с data-copy-text: по клику текст уходит в буфер обмена, а сама
 * ссылка открывается как обычно. Нужно там, где мессенджер не принимает
 * текст в ссылке (MAX): человек вставляет готовую фразу в чат одним действием.
 * Подключено один раз в BaseLayout — работает и в Astro, и в Vue-островах.
 */
export function initCopyOnClick(): void {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>('[data-copy-text]')
    if (link?.dataset.copyText) copyText(link.dataset.copyText)
  })
}

function copyText(text: string): void {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    return
  }
  fallbackCopy(text)
}

/* Браузеры без асинхронного буфера обмена: выделенное поле и команда copy */
function fallbackCopy(text: string): void {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.append(area)
  area.select()
  try { document.execCommand('copy') } catch { /* без буфера ссылка всё равно откроется */ }
  area.remove()
}
