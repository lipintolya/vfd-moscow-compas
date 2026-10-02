/* СГЕНЕРИРОВАНО scripts/gen-article-images.mjs — не править руками.
   Оригинальный URL картинки статьи → облегчённые варианты (srcset).
   Использование — src/lib/article-images.ts. */
export interface ImageVariant { src: string; w: number }

/** Обложки: card — 16:9 для карточек, hero — для шапки статьи. */
export const ARTICLE_COVER_PREVIEWS: Record<string, { card: ImageVariant[]; hero: ImageVariant[] }> = {
  '/renders/articles/alum-zonirovanie-cover.webp': {
    card: [{ src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-card-480.webp', w: 480 }, { src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/alyuminievye-peregorodki-zonirovanie-hero-1600.webp', w: 1600 }],
  },
  '/renders/articles/artdom/cover.webp': {
    card: [{ src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-card-480.webp', w: 480 }, { src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/artdom-2026-tkanevye-peregorodki-vfd-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd74ru/statya/white_doors_statya.webp': {
    card: [{ src: '/renders/articles/covers/belye-dveri-pachkayutsya-card-480.webp', w: 480 }, { src: '/renders/articles/covers/belye-dveri-pachkayutsya-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/belye-dveri-pachkayutsya-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/belye-dveri-pachkayutsya-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/cover_st1.webp': {
    card: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-card-480.webp', w: 480 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/kak-vybrat-mezhkomnatnye-dveri-hero-1600.webp', w: 1600 }],
  },
  '/renders/articles/coatings/cover-2100.webp': {
    card: [{ src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-card-480.webp', w: 480 }, { src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/kakoe-pokrytie-dverei-vybrat-hero-1600.webp', w: 1600 }],
  },
  '/renders/alum-covers/3.webp': {
    card: [{ src: '/renders/articles/covers/loft-industrial-chic-v-interere-card-480.webp', w: 480 }, { src: '/renders/articles/covers/loft-industrial-chic-v-interere-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/loft-industrial-chic-v-interere-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/loft-industrial-chic-v-interere-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd74ru/statya/1.10.26/render_showroom.webp': {
    card: [{ src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-card-480.webp', w: 480 }, { src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/sovremennaya-klassika-v-interiere-hero-1600.webp', w: 1600 }],
  },
  'https://storage.yandexcloud.net/vfd74ru/promo_main/7A842D48-5D78-48B9-AFEE-AA8492800B85.webp': {
    card: [{ src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-card-480.webp', w: 480 }, { src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-card-800.webp', w: 800 }],
    hero: [{ src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-hero-960.webp', w: 960 }, { src: '/renders/articles/covers/vneshnie-i-skrytye-petli-raznitsa-hero-1600.webp', w: 1600 }],
  },
}

/** Фото из текста статей ({% figure %}, {% photo %}, {% card %}). */
export const ARTICLE_IMAGE_VARIANTS: Record<string, ImageVariant[]> = {
  '/renders/alum-covers/1.webp':
    [{ src: '/renders/articles/images/1-f49a4c-640.webp', w: 640 }, { src: '/renders/articles/images/1-f49a4c-960.webp', w: 960 }, { src: '/renders/articles/images/1-f49a4c-1280.webp', w: 1280 }, { src: '/renders/articles/images/1-f49a4c-1600.webp', w: 1600 }],
  '/renders/alum-covers/3.webp':
    [{ src: '/renders/articles/images/3-05793b-640.webp', w: 640 }, { src: '/renders/articles/images/3-05793b-960.webp', w: 960 }, { src: '/renders/articles/images/3-05793b-1280.webp', w: 1280 }, { src: '/renders/articles/images/3-05793b-1600.webp', w: 1600 }],
  '/renders/articles/alum-zonirovanie-studio.webp':
    [{ src: '/renders/articles/images/alum-zonirovanie-studio-f48776-640.webp', w: 640 }, { src: '/renders/articles/images/alum-zonirovanie-studio-f48776-960.webp', w: 960 }, { src: '/renders/articles/images/alum-zonirovanie-studio-f48776-1280.webp', w: 1280 }],
  '/renders/articles/artdom/artdom-1.webp':
    [{ src: '/renders/articles/images/artdom-1-c28801-640.webp', w: 640 }, { src: '/renders/articles/images/artdom-1-c28801-960.webp', w: 960 }],
  '/renders/articles/artdom/artdom-2.webp':
    [{ src: '/renders/articles/images/artdom-2-8071ce-640.webp', w: 640 }, { src: '/renders/articles/images/artdom-2-8071ce-960.webp', w: 960 }],
  '/renders/articles/artdom/artdom-3.webp':
    [{ src: '/renders/articles/images/artdom-3-72d714-640.webp', w: 640 }],
  '/renders/articles/artdom/artdom-4.webp':
    [{ src: '/renders/articles/images/artdom-4-116f07-640.webp', w: 640 }],
  '/renders/articles/artdom/artdom-5.webp':
    [{ src: '/renders/articles/images/artdom-5-474f0c-640.webp', w: 640 }, { src: '/renders/articles/images/artdom-5-474f0c-960.webp', w: 960 }],
  '/renders/hidden-doors/sekret-900.webp':
    [{ src: '/renders/articles/images/sekret-900-e26be8-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/catalog-vfd/alum_info/glass_type/14.webp':
    [{ src: '/renders/articles/images/14-b8febd-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/catalog-vfd/alum_info/glass_type/2.webp':
    [{ src: '/renders/articles/images/2-4a08bc-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/catalog-vfd/alum_info/glass_type/5.webp':
    [{ src: '/renders/articles/images/5-36db9f-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/catalog-vfd/alum_info/glass_type/8.webp':
    [{ src: '/renders/articles/images/8-3f5a3a-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/catalog-vfd/alum_section/decor_type2.webp':
    [{ src: '/renders/articles/images/decor_type2-5a4468-640.webp', w: 640 }, { src: '/renders/articles/images/decor_type2-5a4468-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/catalog-vfd/invisible/cover.webp':
    [{ src: '/renders/articles/images/cover-058767-640.webp', w: 640 }, { src: '/renders/articles/images/cover-058767-960.webp', w: 960 }, { src: '/renders/articles/images/cover-058767-1280.webp', w: 1280 }, { src: '/renders/articles/images/cover-058767-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/catalog-vfd/invisible/invisible.webp':
    [{ src: '/renders/articles/images/invisible-5f30cc-640.webp', w: 640 }, { src: '/renders/articles/images/invisible-5f30cc-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/chitovaya.webp':
    [{ src: '/renders/articles/images/chitovaya-b047ee-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/cover_pet.png':
    [{ src: '/renders/articles/images/cover_pet-c0df6e-640.webp', w: 640 }, { src: '/renders/articles/images/cover_pet-c0df6e-960.webp', w: 960 }, { src: '/renders/articles/images/cover_pet-c0df6e-1280.webp', w: 1280 }, { src: '/renders/articles/images/cover_pet-c0df6e-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/emal_render.webp':
    [{ src: '/renders/articles/images/emal_render-d8ba28-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/emalex_render.webp':
    [{ src: '/renders/articles/images/emalex_render-535dcd-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/Main_page/articles/article_1/filenka.webp':
    [{ src: '/renders/articles/images/filenka-130ae0-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/Main_page/left_bento/render_urban2.webp':
    [{ src: '/renders/articles/images/render_urban2-b4e436-640.webp', w: 640 }, { src: '/renders/articles/images/render_urban2-b4e436-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/info/petli/in.webp':
    [{ src: '/renders/articles/images/in-a409c6-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/info/petli/in_petli.webp':
    [{ src: '/renders/articles/images/in_petli-47e0d4-640.webp', w: 640 }, { src: '/renders/articles/images/in_petli-47e0d4-960.webp', w: 960 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/1.10.26/emalex_er2_cover.webp':
    [{ src: '/renders/articles/images/emalex_er2_cover-66da8e-640.webp', w: 640 }, { src: '/renders/articles/images/emalex_er2_cover-66da8e-960.webp', w: 960 }, { src: '/renders/articles/images/emalex_er2_cover-66da8e-1280.webp', w: 1280 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/1.10.26/reference_cover_palette.webp':
    [{ src: '/renders/articles/images/reference_cover_palette-79d88d-640.webp', w: 640 }, { src: '/renders/articles/images/reference_cover_palette-79d88d-960.webp', w: 960 }, { src: '/renders/articles/images/reference_cover_palette-79d88d-1280.webp', w: 1280 }, { src: '/renders/articles/images/reference_cover_palette-79d88d-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/1.10.26/render_showroom2.webp':
    [{ src: '/renders/articles/images/render_showroom2-980ff3-640.webp', w: 640 }, { src: '/renders/articles/images/render_showroom2-980ff3-960.webp', w: 960 }, { src: '/renders/articles/images/render_showroom2-980ff3-1280.webp', w: 1280 }, { src: '/renders/articles/images/render_showroom2-980ff3-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/1.10.26/svet_cover.webp':
    [{ src: '/renders/articles/images/svet_cover-6f0933-640.webp', w: 640 }, { src: '/renders/articles/images/svet_cover-6f0933-960.webp', w: 960 }, { src: '/renders/articles/images/svet_cover-6f0933-1280.webp', w: 1280 }, { src: '/renders/articles/images/svet_cover-6f0933-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/_cleaning_door.webp':
    [{ src: '/renders/articles/images/_cleaning_door-6354ac-640.webp', w: 640 }, { src: '/renders/articles/images/_cleaning_door-6354ac-960.webp', w: 960 }, { src: '/renders/articles/images/_cleaning_door-6354ac-1280.webp', w: 1280 }, { src: '/renders/articles/images/_cleaning_door-6354ac-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/emal_render.webp':
    [{ src: '/renders/articles/images/emal_render-3cf9c7-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/innova_render.webp':
    [{ src: '/renders/articles/images/innova_render-bc735e-640.webp', w: 640 }],
  'https://storage.yandexcloud.net/vfd74ru/statya/urban_render_pro.webp':
    [{ src: '/renders/articles/images/urban_render_pro-b4e6ab-640.webp', w: 640 }, { src: '/renders/articles/images/urban_render_pro-b4e6ab-960.webp', w: 960 }, { src: '/renders/articles/images/urban_render_pro-b4e6ab-1280.webp', w: 1280 }, { src: '/renders/articles/images/urban_render_pro-b4e6ab-1600.webp', w: 1600 }],
  'https://storage.yandexcloud.net/vfd74ru/works_prod/12.03.26_urban/-c9niw81Q0pjyOPUKFEJpVWlhQlwpIgHowrNhzv-1MHOnf_rTdIZECkewUvjrEaiL-EdKWilBGV6d6HQDUoGa4eo.webp':
    [{ src: '/renders/articles/images/-c9niw81Q0pjyOPUKFEJpVWlhQlwpIgHowrNhzv--ed7acb-640.webp', w: 640 }, { src: '/renders/articles/images/-c9niw81Q0pjyOPUKFEJpVWlhQlwpIgHowrNhzv--ed7acb-960.webp', w: 960 }],
}
