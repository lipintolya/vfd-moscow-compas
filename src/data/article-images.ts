/* СГЕНЕРИРОВАНО scripts/gen-article-images.mjs — не править руками.
   Оригинальный URL картинки статьи → облегчённые варианты (srcset).
   Использование — src/lib/article-images.ts. */
export interface ImageVariant { src: string; w: number }

/** Обложки: card — 16:9 для карточек, hero — для шапки статьи. */
export const ARTICLE_COVER_PREVIEWS: Record<string, { card: ImageVariant[]; hero: ImageVariant[] }> = {
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/statya_cover_emal.webp': {
    card: [{ src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-card-480.webp', w: 480 }, { src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/statya_cover_Invisible.webp': {
    card: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-card-480.webp', w: 480 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-hero-1600.webp', w: 1600 }],
  },
}

/** Фото из текста статей ({% figure %}, {% photo %}, {% card %}). */
export const ARTICLE_IMAGE_VARIANTS: Record<string, ImageVariant[]> = {
  '/renders/alum-covers/14.webp':
    [{ src: '/renders/articles/images/14-093177-640.webp', w: 640 }, { src: '/renders/articles/images/14-093177-960.webp', w: 960 }, { src: '/renders/articles/images/14-093177-1280.webp', w: 1280 }, { src: '/renders/articles/images/14-093177-1600.webp', w: 1600 }],
  '/renders/home/secret-3.webp':
    [{ src: '/renders/articles/images/secret-3-05789c-640.webp', w: 640 }, { src: '/renders/articles/images/secret-3-05789c-960.webp', w: 960 }, { src: '/renders/articles/images/secret-3-05789c-1280.webp', w: 1280 }],
  '/renders/home/tehno-1.webp':
    [{ src: '/renders/articles/images/tehno-1-bf3eda-640.webp', w: 640 }, { src: '/renders/articles/images/tehno-1-bf3eda-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/premium.webp':
    [{ src: '/renders/articles/images/premium-e5262d-640.webp', w: 640 }, { src: '/renders/articles/images/premium-e5262d-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/skinel.webp':
    [{ src: '/renders/articles/images/skinel-9bede6-640.webp', w: 640 }, { src: '/renders/articles/images/skinel-9bede6-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/stockholm.webp':
    [{ src: '/renders/articles/images/stockholm-943aa8-640.webp', w: 640 }, { src: '/renders/articles/images/stockholm-943aa8-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/info/emal/emal_covers.webp':
    [{ src: '/renders/articles/images/emal_covers-8e8cff-640.webp', w: 640 }, { src: '/renders/articles/images/emal_covers-8e8cff-960.webp', w: 960 }, { src: '/renders/articles/images/emal_covers-8e8cff-1280.webp', w: 1280 }, { src: '/renders/articles/images/emal_covers-8e8cff-1600.webp', w: 1600 }],
}
