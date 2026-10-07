/* Открытие PhotoLightbox.vue (один на сайт, смонтирован в BaseLayout)
   — через событие 'open-lightbox'. */
export type LightboxImg = { src: string; alt: string }

export const openLightbox = (images: LightboxImg[], index: number) =>
  window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { images, index } }))

/* Кадр картинки, который браузер уже выбрал из srcset */
export const toImg = (img: HTMLImageElement | null): LightboxImg =>
  ({ src: img?.currentSrc || img?.src || '', alt: img?.alt ?? '' })

/* Группы фото: [data-lightbox] с кнопками [data-lightbox-index].
   Список — из data-lightbox-images (JSON: галерея целиком или крупные
   версии кадров) или из картинок самих кнопок.
   Повторный вызов безопасен: группа помечается и второй раз не
   подписывается (страница и компонент могут вызвать его оба). */
export function initLightboxGroups(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-lightbox]').forEach((group) => {
    if ('lightboxBound' in group.dataset) return
    group.dataset.lightboxBound = ''
    const items = [...group.querySelectorAll<HTMLElement>('[data-lightbox-index]')]
    const preset = group.dataset.lightboxImages
    const images: LightboxImg[] = preset ? JSON.parse(preset) : items.map((el) => toImg(el.querySelector('img')))
    items.forEach((el) => el.addEventListener('click', () => openLightbox(images, Number(el.dataset.lightboxIndex))))
  })
}
