/* Кадры первого экрана главной — единственный источник правды:
   их показывает слайдер (ShowroomHero.astro), первый же кадр греет
   preload в index.astro и служит OG-картинкой по умолчанию (BaseLayout).

   Каждый кадр принадлежит направлению панели (`way`): пока кадр на
   обложке, его направление подсвечено. Порядок — по кругу в порядке
   панели (межкомнатные → скрытые → перегородки), но начинается
   с главной обложки салона — скрытых дверей. */
const CDN = 'https://storage.yandexcloud.net/vfd.moscow.compass/hero.block/hero.block.main'

export type HeroWay = 'interior' | 'hidden' | 'partitions'

export interface HeroSlide {
  src: string
  position: string
  alt: string
  way: HeroWay
}

export const HERO_SLIDES: HeroSlide[] = [
  { src: `${CDN}/hero_block_visual.webp`,  position: '55% 50%', alt: 'Скрытые двери ВФД в стеновых панелях под шеврон', way: 'hidden' },
  { src: `${CDN}/hero_block_visual2.webp`, position: '60% 50%', alt: 'Скрытые двери ВФД заподлицо с терракотовой стеной', way: 'hidden' },
  { src: 'https://storage.yandexcloud.net/catalog-vfd/catalog_preview/catalog-preview3.webp', position: '50% 55%', alt: 'Алюминиевая перегородка со стеклом', way: 'partitions' },
  { src: `${CDN}/hero_block_visual3.webp`, position: '50% 45%', alt: 'Коридор с межкомнатными дверями ВФД', way: 'interior' },
]

export const HERO_COVER_IMAGE = HERO_SLIDES[0].src
