/* ============================================================
   Наши работы — скрытые двери
   Добавляй новые объекты в массив INVISIBLE_WORKS.
   Последний объект — сверху (push в начало массива).
   ============================================================ */

const CDN_WORKS = 'https://storage.yandexcloud.net/catalog-vfd/invisible/ourworks/'

export interface InvisibleWork {
  id:        string    // slug: '2026-06-17-01'
  date:      string    // ISO '2026-06-17'  (Schema.org dateCreated)
  label:     string    // отображение: '17.06.2026'
  title:     string    // заголовок карточки
  story?:    string    // короткая история проекта, 1-2 предложения — факты идут в coating/features, не сюда
  location?: string    // 'Челябинск' или 'Челябинск, мкр. Северок'
  series?:   'Секрет' | 'Секрет Реверс'
  edge?:     'Чёрная' | 'Серебро' | 'Золото'
  coating?:  string    // тип покрытия полотна: 'Грунт под покраску', 'Шпон дуба', 'Эмаль RAL 9003' …
  features?: string[]  // особенности монтажа: ['Короб заподлицо', 'Скрытые петли', 'Без наличников']
  images:    string[]  // полные CDN-ссылки, images[0] — обложка (hero)
}

export const INVISIBLE_WORKS: InvisibleWork[] = [
  {
    id:       '2026-09-08',
    date:     '2026-09-08',
    label:    '8.09.2026',
    title:    'Скрытые двери «Секрет» как часть художественной стены',
    story:    'Двери скрытого монтажа стали продолжением художественной композиции стены — без наличников и лишних деталей, только чистая геометрия и высокие полотна. Дизайн — Екатерина Квашнина.',
    location: 'Челябинск, мкр. Притяжение',
    series:   'Секрет',
    features: ['Без наличников', 'Высокие полотна', 'Дизайн: Екатерина Квашнина'],
    images: [
      'https://storage.yandexcloud.net/vfd74ru/works_prod/8.09.26/invisible_art.webp',
    ],
  },
  {
    id:       '2026-06-17-01',
    date:     '2026-06-17',
    label:    '17.06.2026',
    title:    'Скрытые двери «Секрет» под покраску',
    story:    'Полотно установлено в одной плоскости со стеной, зазоры выверены вручную — после монтажа дверь готова под покраску в цвет стен.',
    location: 'Челябинск, частный объект',
    series:   'Секрет',
    coating:  'Грунт под покраску',
    features: ['Короб заподлицо', 'Скрытые петли', 'Без наличников'],
    images: [
      `${CDN_WORKS}16.06.26/7UN6NAn6RlJoy818Ox6UHyTxUavm1e_Nk32olpTpd38DWB-uy_OVrikpEHd8NPVFmmTdybwyZQvAHtddZbXNAAuR.webp`,
      `${CDN_WORKS}16.06.26/CF5LXIr2L7_lXBexI7LRGPXOVeUmX44RPSNPP-lkSkTXuADcTd7XzorEV1JUazPZnzF0u00kh1q92F1Id2DN0BNe.webp`,
      `${CDN_WORKS}16.06.26/tWn2QcmlFut0c3aki_ODzSnm8xfmYMcxpBFOPKdVM8DK8vZeY9IArl-4nyKS0zXn7cmAheL9F4sjr34G1qhl553s.webp`,
      `${CDN_WORKS}16.06.26/uidj-G7YEZlx-koSXLy4QUJSW-GrP--minZFlWrSnxwvxJ8POKlNOzxeG3AOo5yoIxn9y85cv9DVHxVOEbKEe59n.webp`,
    ],
  },
  {
    id:       '2026-01-05',
    date:     '2026-01-05',
    label:    '5.01.2026',
    title:    'Скрытые двери «Секрет» под покраску с чёрной алюминиевой кромкой',
    story:    'Установили дверь скрытого монтажа с черной алюминиевой кромкой по периметру.',
    location: 'Челябинск',
    series:   'Секрет',
    edge:     'Чёрная',
    images: [
      `${CDN_WORKS}05.01.26/SrSaJHteDxFsF45XRcrxgY1ntwoHiJLdXACpn3C0H32eSurQ4LPGhR9YqAHVEOATSEU3Tw3bBMn_EWe2qMk30uQm.webp`,
      `${CDN_WORKS}05.01.26/Vri69KHrmJZ5ixVa9KptncDKtNeEUv51UWgWhXKFEMqZ0nZ84URREw_llqwQ4nHKcc8bKJh-MZ_SE4lsfdyFSQU8.webp`,
    ],
  },
  {
    id:       '2025-10-21',
    date:     '2025-10-21',
    label:    '21.10.2025',
    title:    'Установка дверей скрытого монтажа перед покраской.',
    story:    'Установили дверь скрытого монтажа с черной алюминиевой кромкой по периметру.',
    location: 'Челябинск, Привилегия',
    series:   'Секрет',
    edge:     'Чёрная',
    images: [
      `${CDN_WORKS}21.10.25/GVUk8kmwYRgdLkO2nAKVkccb7ZReMFQ6bm4DrPVaYG8k6uoAOmZcr20wr3usWUdS_Fy_mFk80Vs8CvZz3aXui6tE-1.webp`,
      `${CDN_WORKS}21.10.25/GVUk8kmwYRgdLkO2nAKVkccb7ZReMFQ6bm4DrPVaYG8k6uoAOmZcr20wr3usWUdS_Fy_mFk80Vs8CvZz3aXui6tE.webp`,
      `${CDN_WORKS}21.10.25/pOSS22itQBq3S9XIiFeQOneKqFxzLZhxhtl8ZP3_Yrnm-uYizveWzgQguHSSu7mrgZgiQY8m0znFwLKu5seYQ8Qb.webp`,
    ],
  },
  {
    id:       '2025-10-17',
    date:     '2025-10-17',
    label:    '17.10.2025',
    title:    'Реализовали идею с поклейкой обоев на дверь скрытого монтажа, фото - наш салон дверей на Кашириных.',
    story:    'Данную дверь можно посмотреть в нашем фирменном салоне на Кашириных',
    location: 'Челябинск, салон дверей ВФД на Кашириных',
    series:   'Секрет',
    edge:     'Чёрная',
    images: [
      `${CDN_WORKS}17.10.25/4a4dICVgZw4zQ6eyxWyX5g57oGMNz6Trzt-g6f3fkxy2Ra4Cd8s3NaEcbOmf-SUdpMvyCmcDiZyx_2sM2UuDzEIJ.webp`,
      `${CDN_WORKS}17.10.25/7kqCtqhk4MBTHq5TQMKuLFS0bEdKUrxoQoW2rfS6Mxph0m1AyqWpQtGhZ7G6862Lu3OEA3ZrSVwypHKDb_Llckx5.webp`,
      `${CDN_WORKS}17.10.25/kdIiQ-53bh6U0RfDlzcgk2Xj12-V6RaKAEmtYB2Kzuj-EGQHjcejMjl5pWh4bjMnXXEC-yDbIvc0U1mCB-RkvZ8D.webp`,
    ],
  },
  {
    id:       '2025-07-29',
    date:     '2025-07-29',
    label:    '29.07.2025',
    title:    'Установили двери скрытого монтажа в Привилегии',
    story:    'Установили двери скрытого монтажа в Привилегии',
    location: 'Челябинск, Привилегия',
    series:   'Секрет',
    edge:     'Чёрная',
    images: [
      `${CDN_WORKS}29.07.25/-tygOqs6wWnQRncuyldbijKD30OM1RSc1rm0INTl1Xf5-7kpZwGgQxV25AAdzllP-FNh7amcKdZ0Lxb7er_V3P6P.webp`,
      `${CDN_WORKS}29.07.25/A6w3g6VFobsKsLaxAhvYypDKKbhmM5qT16v_5cirjfO-Oww6diFQXoMt4lpjN5-rwjCXh9IvvlhRJRCAOXVbi0x7.webp`,
      `${CDN_WORKS}29.07.25/L_thnz01M389akNR7PIdwcMnaC2bMpOJoK-P4464-Hu_bogj6prnFk_kvd7Ae6DlAtqWVQseR9BTWeuqPMgEC3CZ.webp`,
      `${CDN_WORKS}29.07.25/bJnzaZd486cmu-j3C-T_LVXmEWQ_2CZp9PMAIO4HuYVC_mzHjnDif0kRXUtRFCN6GOJe82Lq0QUziz__uNTynd9t.webp`,
      `${CDN_WORKS}29.07.25/bzDNJ6XEeYDby_Uflth_lNZjvZ9a88OPkGw7VEa2VAniUt-6wE1b--lV8Uy4AojA2Jr8cshdwIhUFfQZfx9_HlEp.webp`,
      `${CDN_WORKS}29.07.25/wtyYghspdRhfrTNLaeRWb4NIlTxv5EKE4fjYu59AFNATzLNut6rDqFJfDaL4ix2LDryK6YCH8ITGgArplRG7twF0.webp`,
    ],
  },
]
