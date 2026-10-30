/**
 * Подстановки в текстах статей (Strapi): директор пишет {адрес салона},
 * {цена комплекта Секрет} … — при сборке на их месте значения из данных
 * сайта (src/lib/article-vars.ts). Имя → путь в ARTICLE_VARS.
 * Новое имя — сюда и в инструкцию docs/director-guide.md (тест сверяет).
 */
export const ARTICLE_SUBSTITUTIONS: Record<string, string> = {
  'название салона':                 'salon.name',
  'бренд':                           'salon.brand',
  'в городе':                        'salon.city',
  'торговый центр':                  'salon.mall',
  'адрес салона':                    'salon.address',
  'часы работы':                     'salon.hours',
  'телефон':                         'salon.phone',
  'официальный дилер':               'salon.dealer',
  'цена комплекта Секрет':           'hidden.kitFrom',
  'цена полотна Секрет':             'hidden.bladeFrom',
  'цена комплекта Секрет Реверс':    'hidden.reversKitFrom',
  'цена комплекта Рефлекс':          'hidden.reflexKitFrom',
  'высота скрытой двери':            'hidden.height',
  'макс. высота скрытой двери':      'hidden.maxHeight',
  'макс. высота Рефлекс':            'hidden.reflexMaxHeight',
  'срок изготовления скрытой двери': 'hidden.leadTime',
  'ширины Секрет':                   'hidden.widths',
  'ширины Секрет Реверс':            'hidden.reversWidths',
  'зазор скрытой двери':             'hidden.gap',
  'мин. толщина стены':              'hidden.wallMin',
  'нагрузка на петли':               'hidden.hingeLoad',
  'слои покраски':                   'hidden.paintCoats',
  'срок монтажа скрытой двери':      'hidden.installDays',
  'профиль короба':                  'hidden.boxProfile',
  'высоты на складе':                'hidden.stockHeights',
  'цена комплекта 2300':             'hidden.kit2300From',
  'надбавка за 2300':                'hidden.surcharge2300',
  'стандартная высота двери':        'doors.height',
  'макс. высота двери':              'doors.maxHeight',
  'входных дверей в каталоге':       'entrance.models',
  'цена входных дверей':             'entrance.priceFrom',
  'сталь входных дверей':            'entrance.steel',
  'входных дверей с терморазрывом':  'entrance.thermo',
  'размеры входных дверей':          'entrance.sizes',
  'цена фальшфрамуги':               'decor.framugaKitFrom',
  'размер фальшфрамуги':             'decor.framugaSize',
  'условия замера':                  'services.measure',
  'условия установки':               'services.install',
}

/** Путь в ARTICLE_VARS → имя подстановки (для переноса статей из Markdoc) */
export const SUBSTITUTION_BY_PATH: Record<string, string> =
  Object.fromEntries(Object.entries(ARTICLE_SUBSTITUTIONS).map(([name, path]) => [path, name]))
