/**
 * Блокировка прокрутки страницы под модальными окнами (меню, фильтры,
 * калькулятор, просмотр фото).
 *
 * Блокируем html, а не body: у html задан overflow-x: clip (global.css),
 * а по правилам CSS overflow у body передаётся окну, только если у html
 * overflow: visible — поэтому body.style.overflow = 'hidden' прокрутку не
 * останавливал, страница уезжала под открытым окном (проверено в браузере).
 *
 * Окна могут открываться поверх друг друга (просмотр фото из калькулятора),
 * поэтому общий счётчик: прокрутка вернётся, когда закроется последнее.
 * Каждый useScrollLock() держит не больше одной блокировки и снимает
 * только свою — повторный unlock или закрытие чужого окна её не собьют.
 * Сдвиг вёрстки при исчезновении полосы прокрутки гасит
 * scrollbar-gutter: stable у html (global.css).
 */
import { getCurrentInstance, onBeforeUnmount } from 'vue'

let holders = 0

const apply = () => {
  document.documentElement.style.overflow = holders > 0 ? 'hidden' : ''
}

export function useScrollLock() {
  let held = false

  const lock = () => {
    if (held || typeof document === 'undefined') return
    held = true
    holders++
    apply()
  }

  const unlock = () => {
    if (!held) return
    held = false
    holders--
    apply()
  }

  // Компонент убрали с открытым окном — блокировка не должна остаться
  if (getCurrentInstance()) onBeforeUnmount(unlock)

  return { lock, unlock }
}
