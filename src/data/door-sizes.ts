/* Высота межкомнатных дверей каталога: стандарт и предел под заказ (мм).
   Источник для страницы «Дизайнерам» и статей (src/lib/article-vars.ts).
   Скрытые двери — свои размеры, в skrytye-dveri-products.ts. */
export const DOOR_SIZES = {
  standardHeight:  2000,
  /** Высота полотна под заказ — до этой, мм */
  customMaxHeight: 3000,
} as const
