-- Серия «Урбан Лофт» (покрытие Экошпон, цвета под бетон): 5 моделей, 8 позиций.
-- Источник — витрина фабрики https://vfd-74.ru/Ekoshpon, блок «Серия Urban» (06.11.2026).
--
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- Повторный запуск безопасен (on conflict do nothing).
--
-- Модели — как у Урбана на Эмалексе: одна строка models на модель+кромку
-- (Урбан ЗТ SE/BE, Урбан 1 SM/BM, Урбан 2ГР BM), коды кромки — по файлам
-- фабрики, подписи «Серебро»/«Чёрная» даёт src/lib/trim-labels.ts.
--
-- Цены — текущие розничные (полотно), в src/lib/price-adjustments.ts серия
-- не входит. Урбан 1 SM бетон светлый — 9 470 ₽ по акции фабрики (обычная
-- цена на витрине не указана): после акции поправить price_rrp.
-- Погонаж серии (комплект 3 850 ₽) — src/data/accessories.ts, SERIES_ACCESSORIES.
--
-- Фото уже лежат в репозитории: public/media/catalog/urban_loft/*.webp.
-- Чтобы ссылки открывались и из админки — залейте те же файлы в бакет
-- vfd74ru по пути catalog/urban_loft/.

begin;

insert into series (id, coating_id, name, slug) values
  ('5980b1c7-7aba-4f77-8422-8ddc96eba322', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Урбан Лофт', 'urban-loft')
on conflict do nothing;

insert into colors (id, coating_id, name, hex_preview) values
  ('b96a90ca-86cf-46a3-8008-8fb45d6744f4', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Бетон светлый', '#b0afac'),
  ('286c945d-5948-47d1-b006-53c3c9160beb', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Бетон тёмный',  '#3d3e40')
on conflict do nothing;

insert into models (id, series_id, name, sku, has_glass, trim) values
  ('c5852ea4-16ff-4e15-9751-70dce14d3ad8', '5980b1c7-7aba-4f77-8422-8ddc96eba322', 'Урбан ЗТ',  'URBAN-LOFT-ZT-SE',  false, 'SE 4x4'),
  ('e2adc153-e5f4-4e2a-8254-63f9cf36f19c', '5980b1c7-7aba-4f77-8422-8ddc96eba322', 'Урбан ЗТ',  'URBAN-LOFT-ZT-BE',  false, 'BE 4x4'),
  ('309b0aaa-94a8-4637-8140-9d0a143070a8', '5980b1c7-7aba-4f77-8422-8ddc96eba322', 'Урбан 1',   'URBAN-LOFT-1-SM',   false, 'SM 4x4'),
  ('c4c95fa8-de1b-446b-83da-f4bf8d730b59', '5980b1c7-7aba-4f77-8422-8ddc96eba322', 'Урбан 1',   'URBAN-LOFT-1-BM',   false, 'BM 4x4'),
  ('161466bf-6494-45cc-87e2-aca7b8ec9b62', '5980b1c7-7aba-4f77-8422-8ddc96eba322', 'Урбан 2ГР', 'URBAN-LOFT-2GR-BM', false, 'BM 4x4')
on conflict do nothing;

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  -- Урбан ЗТ, кромка серебро
  ('c5852ea4-16ff-4e15-9751-70dce14d3ad8', 'b96a90ca-86cf-46a3-8008-8fb45d6744f4', 9840,  'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_z_concrete_light_se.webp'),
  ('c5852ea4-16ff-4e15-9751-70dce14d3ad8', '286c945d-5948-47d1-b006-53c3c9160beb', 9840,  'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_z_concrete_dark_se.webp'),
  -- Урбан ЗТ, кромка чёрная
  ('e2adc153-e5f4-4e2a-8254-63f9cf36f19c', 'b96a90ca-86cf-46a3-8008-8fb45d6744f4', 9840,  'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_z_concrete_light_be.webp'),
  ('e2adc153-e5f4-4e2a-8254-63f9cf36f19c', '286c945d-5948-47d1-b006-53c3c9160beb', 9840,  'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_z_concrete_dark_be.webp'),
  -- Урбан 1, серебро (акция)
  ('309b0aaa-94a8-4637-8140-9d0a143070a8', 'b96a90ca-86cf-46a3-8008-8fb45d6744f4', 9470,  'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_1_concrete_light_sm.webp'),
  -- Урбан 1, чёрная
  ('c4c95fa8-de1b-446b-83da-f4bf8d730b59', 'b96a90ca-86cf-46a3-8008-8fb45d6744f4', 10520, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_1_concrete_light_bm.webp'),
  ('c4c95fa8-de1b-446b-83da-f4bf8d730b59', '286c945d-5948-47d1-b006-53c3c9160beb', 10520, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_1_concrete_dark_bm.webp'),
  -- Урбан 2ГР, чёрная
  ('161466bf-6494-45cc-87e2-aca7b8ec9b62', '286c945d-5948-47d1-b006-53c3c9160beb', 10520, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_loft/urban_2h_concrete_dark_bm.webp')
on conflict do nothing;

commit;

-- Проверка: должно вернуть 8 строк
-- select m.name, m.trim, c.name, mc.price_rrp
-- from model_colors mc
-- join models m on m.id = mc.model_id
-- join colors c on c.id = mc.color_id
-- where m.series_id = '5980b1c7-7aba-4f77-8422-8ddc96eba322'
-- order by m.name, m.trim, c.name;
