-- Урбан Древесный: Урбан ЗТ в новом цвете «Пекан золотой» (рисунок «ёлочкой»),
-- две кромки с молдингом — золотая (ЗК ЗМ) и чёрная (ЧК ЧМ). 2 модели, 2 позиции.
-- Источник — витрина фабрики https://vfd-ural.ru/Ekoshpon#urbanwood (06.11.2026).
--
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- Повторный запуск безопасен (on conflict do nothing).
--
-- Модели — отдельные строки models (как у остальных Урбан ЗТ серии: одна
-- строка на кромку): у существующих ЗТ кромки без молдинга (ЗК, СК, ЧК).
-- Подписи «Золотая с молдингом» / «Чёрная с молдингом» — src/lib/trim-labels.ts.
--
-- ЦЕНА 18 270 ₽. Наш прайс по серии выше витрины vfd-ural.ru (Урбан ЗТ у нас
-- 16 610 ₽, там 15 080 ₽), поэтому цену с витрины (16 590 ₽) не берём как есть —
-- иначе «Пекан золотой» вышел бы дешевле обычного ЗТ. На витрине он дороже
-- обычного ЗТ в 16 590 / 15 080 = 1,10 раза; та же наценка к нашим 16 610 ₽
-- → 18 270 ₽ (округлено до 10 ₽).
--
-- Погонаж «Пекан золотой» отличается от остальных цветов серии (комплект
-- 5 325 ₽ против 5 400 ₽) — src/data/accessories.ts, COLOR_ACCESSORIES.
--
-- Фото уже лежат в репозитории: public/media/catalog/urban_wood/urban_z/{gold,black}/.

begin;

insert into colors (id, coating_id, name, hex_preview) values
  ('d3268bd5-fc90-4660-94c8-53d51c9f2143', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Пекан золотой', '#543926')
on conflict do nothing;

insert into models (id, series_id, name, sku, has_glass, trim) values
  ('df3968ae-edf2-492a-9a17-d00df104dc30', 'c2d8246b-6f04-4c36-a359-0703f7e38d64', 'Урбан ЗТ', 'URBAN-EKO-ZT-ZK-ZM',   false, '4х4 ЗК ЗМ'),
  ('6e4c2664-0520-4f59-84a1-79b2bfe55333', 'c2d8246b-6f04-4c36-a359-0703f7e38d64', 'Урбан ЗТ', 'URBAN-EKO-ZT-CHK-CHM', false, '4х4 ЧК ЧМ')
on conflict do nothing;

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  ('df3968ae-edf2-492a-9a17-d00df104dc30', 'd3268bd5-fc90-4660-94c8-53d51c9f2143', 18270, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/gold/urban_z_pecan_gold_cross_ge_4x4.webp'),
  ('6e4c2664-0520-4f59-84a1-79b2bfe55333', 'd3268bd5-fc90-4660-94c8-53d51c9f2143', 18270, 'https://storage.yandexcloud.net/vfd74ru/catalog/urban_wood/urban_z/black/urban_z_pecan_gold_cross_be_4x4.webp')
on conflict do nothing;

commit;

-- Проверка: должно вернуть 2 строки
-- select m.name, m.trim, c.name, mc.price_rrp
-- from model_colors mc
-- join models m on m.id = mc.model_id
-- join colors c on c.id = mc.color_id
-- where c.name = 'Пекан золотой';
