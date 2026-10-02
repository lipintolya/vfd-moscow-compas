/* Кадры первого экрана главной — единственный источник правды:
   их показывает слайдер (ShowroomHero.astro), первый же кадр греет
   preload в index.astro и служит OG-картинкой по умолчанию (BaseLayout). */
const CDN = 'https://storage.yandexcloud.net/vfd.moscow.compass/hero.block/hero.block.main'

export const HERO_SLIDES = [
  { src: `${CDN}/hero_block_visual.webp`,  position: '55% 50%', alt: 'Скрытые двери ВФД в стеновых панелях под шеврон' },
  { src: `${CDN}/hero_block_visual2.webp`, position: '60% 50%', alt: 'Скрытые двери ВФД заподлицо с терракотовой стеной' },
  { src: `${CDN}/hero_block_visual3.webp`, position: '50% 45%', alt: 'Коридор с межкомнатными дверями ВФД' },
]

export const HERO_COVER_IMAGE = HERO_SLIDES[0].src
