/* СГЕНЕРИРОВАНО scripts/gen-article-images.mjs — не править руками.
   Оригинальный URL картинки статьи → облегчённые варианты (srcset).
   Использование — src/lib/article-images.ts. */
export interface ImageVariant { src: string; w: number }

/** Обложки: card — 16:9 для карточек, hero — для шапки статьи. */
export const ARTICLE_COVER_PREVIEWS: Record<string, { card: ImageVariant[]; hero: ImageVariant[] }> = {
  '/renders/vfd-design/louvre-cover.webp': {
    card: [{ src: '/renders/articles/covers/dver-s-zhalyuzi-card-480.webp', w: 480 }, { src: '/renders/articles/covers/dver-s-zhalyuzi-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/dver-s-zhalyuzi-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/dver-s-zhalyuzi-hero-1600.webp', w: 1600 }],
  },
  '/renders/alum-covers/7.webp': {
    card: [{ src: '/renders/articles/covers/dveri-so-steklom-ili-gluhie-card-480.webp', w: 480 }, { src: '/renders/articles/covers/dveri-so-steklom-ili-gluhie-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/dveri-so-steklom-ili-gluhie-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/dveri-so-steklom-ili-gluhie-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/statya_cover_emal.webp': {
    card: [{ src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-card-480.webp', w: 480 }, { src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/dveri-v-emali-plyusy-i-minusy-hero-1600.webp', w: 1600 }],
  },
  '/renders/alum-covers/3.webp': {
    card: [{ src: '/renders/articles/covers/dveri-v-stile-loft-card-480.webp', w: 480 }, { src: '/renders/articles/covers/dveri-v-stile-loft-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/dveri-v-stile-loft-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/dveri-v-stile-loft-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/statya_cover_Invisible.webp': {
    card: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-card-480.webp', w: 480 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnuyu-dver-hero-1600.webp', w: 1600 }],
  },
  '/renders/alum-covers/37.webp': {
    card: [{ src: '/renders/articles/covers/kakuyu-dver-vybrat-v-vannuyu-card-480.webp', w: 480 }, { src: '/renders/articles/covers/kakuyu-dver-vybrat-v-vannuyu-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/kakuyu-dver-vybrat-v-vannuyu-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/kakuyu-dver-vybrat-v-vannuyu-hero-1600.webp', w: 1600 }],
  },
  '/renders/home/secret-cover.webp': {
    card: [{ src: '/renders/articles/covers/na-kakom-etape-remonta-ustanavlivayut-dveri-card-480.webp', w: 480 }, { src: '/renders/articles/covers/na-kakom-etape-remonta-ustanavlivayut-dveri-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/na-kakom-etape-remonta-ustanavlivayut-dveri-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/na-kakom-etape-remonta-ustanavlivayut-dveri-hero-1600.webp', w: 1600 }],
  },
  '/renders/alum-covers/2.webp': {
    card: [{ src: '/renders/articles/covers/populyarnye-mezhkomnatnye-dveri-card-480.webp', w: 480 }, { src: '/renders/articles/covers/populyarnye-mezhkomnatnye-dveri-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/populyarnye-mezhkomnatnye-dveri-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/populyarnye-mezhkomnatnye-dveri-hero-1600.webp', w: 1600 }],
  },
  '/renders/alum-covers/36.webp': {
    card: [{ src: '/renders/articles/covers/skrytye-dveri-plyusy-i-minusy-card-480.webp', w: 480 }, { src: '/renders/articles/covers/skrytye-dveri-plyusy-i-minusy-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/skrytye-dveri-plyusy-i-minusy-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/skrytye-dveri-plyusy-i-minusy-hero-1600.webp', w: 1600 }],
  },
  '/renders/vfd-design/cover.webp': {
    card: [{ src: '/renders/articles/covers/vfd-dizain-dveri-pod-zadachu-card-480.webp', w: 480 }, { src: '/renders/articles/covers/vfd-dizain-dveri-pod-zadachu-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/vfd-dizain-dveri-pod-zadachu-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/vfd-dizain-dveri-pod-zadachu-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd74ru/decor/render_framuga.webp': {
    card: [{ src: '/renders/articles/covers/vysokie-mezhkomnatnye-dveri-card-480.webp', w: 480 }, { src: '/renders/articles/covers/vysokie-mezhkomnatnye-dveri-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/vysokie-mezhkomnatnye-dveri-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/vysokie-mezhkomnatnye-dveri-hero-1600.webp', w: 1600 }],
  },
}

/** Фото из текста статей ({% figure %}, {% photo %}, {% card %}). */
export const ARTICLE_IMAGE_VARIANTS: Record<string, ImageVariant[]> = {
  '/renders/alum-covers/12.webp':
    [{ src: '/renders/articles/images/12-afb80b-640.webp', w: 640 }, { src: '/renders/articles/images/12-afb80b-960.webp', w: 960 }, { src: '/renders/articles/images/12-afb80b-1280.webp', w: 1280 }, { src: '/renders/articles/images/12-afb80b-1600.webp', w: 1600 }],
  '/renders/alum-covers/14.webp':
    [{ src: '/renders/articles/images/14-093177-640.webp', w: 640 }, { src: '/renders/articles/images/14-093177-960.webp', w: 960 }, { src: '/renders/articles/images/14-093177-1280.webp', w: 1280 }, { src: '/renders/articles/images/14-093177-1600.webp', w: 1600 }],
  '/renders/hidden-doors/reflex-900.webp':
    [{ src: '/renders/articles/images/reflex-900-69057f-640.webp', w: 640 }],
  '/renders/hidden-doors/sekret-900.webp':
    [{ src: '/renders/articles/images/sekret-900-e26be8-640.webp', w: 640 }],
  '/renders/hidden-doors/sekret-revers-900.webp':
    [{ src: '/renders/articles/images/sekret-revers-900-1d72b4-640.webp', w: 640 }],
  '/renders/home/secret-2.webp':
    [{ src: '/renders/articles/images/secret-2-7b18c8-640.webp', w: 640 }, { src: '/renders/articles/images/secret-2-7b18c8-960.webp', w: 960 }, { src: '/renders/articles/images/secret-2-7b18c8-1280.webp', w: 1280 }],
  '/renders/home/secret-3.webp':
    [{ src: '/renders/articles/images/secret-3-05789c-640.webp', w: 640 }, { src: '/renders/articles/images/secret-3-05789c-960.webp', w: 960 }, { src: '/renders/articles/images/secret-3-05789c-1280.webp', w: 1280 }],
  '/renders/home/tehno-1.webp':
    [{ src: '/renders/articles/images/tehno-1-bf3eda-640.webp', w: 640 }, { src: '/renders/articles/images/tehno-1-bf3eda-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/catalog-vfd/invisible/invisible_info/invisible_kompl.webp':
    [{ src: '/renders/articles/images/invisible_kompl-1a1db6-640.webp', w: 640 }, { src: '/renders/articles/images/invisible_kompl-1a1db6-960.webp', w: 960 }, { src: '/renders/articles/images/invisible_kompl-1a1db6-1280.webp', w: 1280 }, { src: '/renders/articles/images/invisible_kompl-1a1db6-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/catalog-vfd/invisible/invisible_info/invisible_lr.webp':
    [{ src: '/renders/articles/images/invisible_lr-81b473-640.webp', w: 640 }, { src: '/renders/articles/images/invisible_lr-81b473-960.webp', w: 960 }, { src: '/renders/articles/images/invisible_lr-81b473-1280.webp', w: 1280 }, { src: '/renders/articles/images/invisible_lr-81b473-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd.moscow.compass/hero.block/vfd.design.post/2026-10-10%2016.25.03.webp':
    [{ src: '/renders/articles/images/2026-10-10-2016-25-03-47526e-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd.moscow.compass/hero.block/vfd.design.post/2026-10-10%2016.25.08.webp':
    [{ src: '/renders/articles/images/2026-10-10-2016-25-08-eeb3c7-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/10.10.26_vfd_design/2026-10-10%2015.46.04.webp':
    [{ src: '/renders/articles/images/2026-10-10-2015-46-04-c88f9f-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/10.10.26_vfd_design/2026-10-10%2015.46.08.webp':
    [{ src: '/renders/articles/images/2026-10-10-2015-46-08-00476d-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/10.10.26_vfd_design/2026-10-10%2015.46.10.webp':
    [{ src: '/renders/articles/images/2026-10-10-2015-46-10-fde236-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/10.10.26_vfd_design/2026-10-10%2015.46.13.webp':
    [{ src: '/renders/articles/images/2026-10-10-2015-46-13-fe589c-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd.moscow.compass/statya.block/10.10.26_vfd_design/2026-10-10%2015.46.15.webp':
    [{ src: '/renders/articles/images/2026-10-10-2015-46-15-8f9137-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/urban_cover_wood.webp':
    [{ src: '/renders/articles/images/urban_cover_wood-61f459-640.webp', w: 640 }, { src: '/renders/articles/images/urban_cover_wood-61f459-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/basic.webp':
    [{ src: '/renders/articles/images/basic-5f627b-640.webp', w: 640 }, { src: '/renders/articles/images/basic-5f627b-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/elegant.webp':
    [{ src: '/renders/articles/images/elegant-2e31eb-640.webp', w: 640 }, { src: '/renders/articles/images/elegant-2e31eb-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/antique_luxe.webp':
    [{ src: '/renders/articles/images/antique_luxe-7f8dbb-640.webp', w: 640 }, { src: '/renders/articles/images/antique_luxe-7f8dbb-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/linea.webp':
    [{ src: '/renders/articles/images/linea-c2ddad-640.webp', w: 640 }, { src: '/renders/articles/images/linea-c2ddad-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/premium.webp':
    [{ src: '/renders/articles/images/premium-e5262d-640.webp', w: 640 }, { src: '/renders/articles/images/premium-e5262d-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/skinel.webp':
    [{ src: '/renders/articles/images/skinel-9bede6-640.webp', w: 640 }, { src: '/renders/articles/images/skinel-9bede6-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emal/stockholm.webp':
    [{ src: '/renders/articles/images/stockholm-943aa8-640.webp', w: 640 }, { src: '/renders/articles/images/stockholm-943aa8-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/emalex.webp':
    [{ src: '/renders/articles/images/emalex-91e2bf-640.webp', w: 640 }, { src: '/renders/articles/images/emalex-91e2bf-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/pet/urban_pet.webp':
    [{ src: '/renders/articles/images/urban_pet-3b95b8-640.webp', w: 640 }, { src: '/renders/articles/images/urban_pet-3b95b8-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/cover_first_section/urban.webp':
    [{ src: '/renders/articles/images/urban-091a83-640.webp', w: 640 }, { src: '/renders/articles/images/urban-091a83-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/decor/framuga_type.webp':
    [{ src: '/renders/articles/images/framuga_type-c0de9e-640.webp', w: 640 }, { src: '/renders/articles/images/framuga_type-c0de9e-960.webp', w: 960 }, { src: '/renders/articles/images/framuga_type-c0de9e-1280.webp', w: 1280 }, { src: '/renders/articles/images/framuga_type-c0de9e-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/info/emal/emal_covers.webp':
    [{ src: '/renders/articles/images/emal_covers-8e8cff-640.webp', w: 640 }, { src: '/renders/articles/images/emal_covers-8e8cff-960.webp', w: 960 }, { src: '/renders/articles/images/emal_covers-8e8cff-1280.webp', w: 1280 }, { src: '/renders/articles/images/emal_covers-8e8cff-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/invisible/render_alum_lite.webp':
    [{ src: '/renders/articles/images/render_alum_lite-fcf80c-640.webp', w: 640 }, { src: '/renders/articles/images/render_alum_lite-fcf80c-960.webp', w: 960 }, { src: '/renders/articles/images/render_alum_lite-fcf80c-1280.webp', w: 1280 }],
  'https://storage.yandexcloud.net/vfd74ru/invisible/render_alum_pro.webp':
    [{ src: '/renders/articles/images/render_alum_pro-12c4f0-640.webp', w: 640 }, { src: '/renders/articles/images/render_alum_pro-12c4f0-960.webp', w: 960 }, { src: '/renders/articles/images/render_alum_pro-12c4f0-1280.webp', w: 1280 }],
}
