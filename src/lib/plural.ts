/* Склонение по числу. Отдельный модуль без зависимостей — подключается и
   в клиентских островах (каталог), не утягивая за собой product-text
   с текстами серий. */

/** pluralRu(3, ['модель', 'модели', 'моделей']) → «модели» */
export function pluralRu(n: number, [one, few, many]: [string, string, string]): string {
  const mod10 = n % 10, mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
