/* Обложка первого слайда HeroSlider — единственный источник правды,
   используется и в самом слайдере, и как preload-хинт в index.astro
   (BaseLayout preloadImage). Раньше preload тянул отдельный захардкоженный
   URL, который разъехался с реальной первой картинкой слайдера — браузер
   грел не тот ресурс, а настоящий LCP-кадр грузился без буста. */
export const HERO_COVER_IMAGE = 'https://storage.yandexcloud.net/vfd74ru/Main_page_perfomance-covers/emalex_render.webp'

/* Уменьшенная версия того же кадра (800w, локальный файл — сгенерирована
   sharp'ом из оригинала на Yandex Cloud, storage не отдаёт ресайз по query
   параметрам). Мобильный LCP грузил тот же ~1670px файл, что и десктоп —
   на throttled 4G это давало LCP 5.2s вместо 2.5s на десктопе. srcset даёт
   браузеру выбрать этот вариант на узких вьюпортах. */
export const HERO_COVER_IMAGE_MOBILE = '/renders/hero/emalex-render-mobile.webp'
export const HERO_COVER_IMAGE_SRCSET = `${HERO_COVER_IMAGE_MOBILE} 800w, ${HERO_COVER_IMAGE} 1448w`
