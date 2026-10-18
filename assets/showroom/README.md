# Фото шоурума «Студии Зизевского» (ТЦ «Компас»)

Фото салона от владельца, 12 кадров (900×1200 или 1280×960). Исходники
пришли PNG, здесь — WebP q92 (без заметных потерь, в 5 раз легче).

`npm run gen:photos` → `public/renders/about/showroom-N-<хеш>-{480,900}.webp`
и `src/data/showroom-photos.json`. Подписи — `src/data/showroom.ts`
(номер кадра = номер файла: убрали фото и перенумеровали — сдвиньте
подписи и номера в `SALON_FROM_SHOWROOM`, `src/data/contacts-page.ts`).
Порядок превью на «О нас» — `SHOWROOM_PREVIEW` в `src/data/about-page.ts`.
