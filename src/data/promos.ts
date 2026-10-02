/**
 * src/data/promos.ts
 *
 * Акции и спецпредложения — блок Promo.vue на главной показывает активные
 * (validUntil ещё не прошёл), страница /promo-archive — истёкшие.
 *
 * КАК ДОБАВИТЬ АКЦИЮ: добавь объект в конец массива PROMOS. Когда validUntil
 * пройдёт, акция сама уйдёт с главной в архив — ничего вручную переносить
 * не нужно, дата решает.
 */

export interface Promo {
  id:            number
  title:         string
  subtitle:      string
  description:   string
  /** Пусто у заглушек — вместо фото выводится нейтральная плашка */
  image?:        string
  /** 640w/800w локальные срезы (см. gen-promo-images.mjs) — оригиналы с
      Yandex Cloud кратно крупнее реального размера карточки (~400px CSS,
      800px на retina). Опционально: пока не сгенерирован набор под новую
      акцию, компоненты падают обратно на просто image. */
  imageSrcset?:  string
  ctaText?:      string
  ctaLink?:      string
  discount?:     string
  validUntil:    string
  /** Заглушка (PLACEHOLDER): реальной акции ещё нет — без даты, фото и
      ссылок. Заменить на настоящую акцию, когда салон её утвердит. */
  placeholder?:  boolean
}

/* PLACEHOLDER — акции московского салона ещё не утверждены. Прежний список
   (акции другого салона) удалён; см. историю git. Дата заглушек — далеко
   в будущем, чтобы они считались активными; в интерфейсе она не выводится. */
const placeholderPromo = (id: number): Promo => ({
  id,
  title: 'Название акции',
  subtitle: 'Условия акции',
  description: 'Описание акции появится позже.',
  validUntil: '2099-12-31',
  placeholder: true,
})

export const PROMOS: Promo[] = [
  placeholderPromo(1),
  placeholderPromo(2),
  placeholderPromo(3),
]
