# Фото перегородок ALUM фабрики ОНИКС

Оригиналы картинок для страницы **«Перегородки ОНИКС ALUM»** — `/partitions/oniks-alum/`.
Источник — сайт фабрики ОНИКС (`oniks-dveri.ru/catalog/alum-peregorodki/`), октябрь 2026,
в рамках коллаборации со Студией Зизевского.

На сайт эти файлы напрямую не попадают: скрипт делает из них облегчённые `.webp`
в `public/renders/oniks-alum/`.

## Что где лежит

| Файл | Где на странице |
|---|---|
| `models/alum-01.jpg` … `alum-10.jpg` | карточки раскладок №1–10 (вертикальные, 402 × 1000) |
| `info/interior.jpg` | первый экран — перегородки в интерьере |
| `info/layouts.jpg` | схема всех десяти раскладок |
| `info/profile-colors.jpg` | цвета профиля |
| `info/components.jpg` | комплектующие |
| `info/opti-white.jpg` | сравнение стекла Opti White и обычного |

## Как заменить или добавить фото

1. Положите новый файл **с тем же именем** в эту папку (jpg, png или webp).
2. Выполните в корне проекта:

   ```bash
   npm run gen:oniks
   ```

3. Если изменились пропорции картинки — обновите `width` / `height` в
   `src/data/oniks-alum.ts` (скрипт печатает новые размеры).

Новая раскладка: файл `models/alum-11.jpg` + строка в `ONIKS_MODELS` в
`src/data/oniks-alum.ts`.

Тексты, характеристики и вопросы страницы — тоже в `src/data/oniks-alum.ts`,
сама страница — `src/pages/partitions/oniks-alum.astro`.
