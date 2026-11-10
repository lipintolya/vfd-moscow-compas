-- Серия «Элегант Древесный» (покрытие Экошпон): 4 модели × 2 цвета = 8 позиций.
-- Источник — витрина фабрики https://vfd-74.ru/Ekoshpon (06.11.2026).
--
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- Повторный запуск безопасен (on conflict do nothing).
--
-- Цены — текущие розничные (полотно), в src/lib/price-adjustments.ts серия
-- не входит, на сайте покажутся как есть. Комплект погонажа этой серии
-- (3 850 ₽) и сам погонаж — в src/data/accessories.ts (SERIES_ACCESSORIES),
-- не по покрытию: у Урбан Древесного (тот же Экошпон) прайс другой.
--
-- Фото уже лежат в репозитории: public/media/catalog/elegant_wood/*.webp.
-- Ссылки ниже — облачные по общему правилу (media-path.mjs), сборка сама
-- возьмёт локальный файл. Чтобы ссылка открывалась и из админки, залейте
-- те же файлы в бакет vfd74ru по пути catalog/elegant_wood/.

begin;

insert into series (id, coating_id, name, slug) values
  ('219d3786-c3dd-4644-8000-cbee2b27d656', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Элегант Древесный', 'elegant-drevesnyy')
on conflict do nothing;

insert into colors (id, coating_id, name, hex_preview) values
  ('0022d03a-83f3-48d4-8092-faa5bd9dc3ff', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Дуб красный',     '#ac9e92'),
  ('9d691ee7-50db-46ea-a7f4-a020bbdf5092', 'b7fd1692-7fc0-4b8f-ab8c-c3058f22d16c', 'Дуб арктический', '#d1cec8')
on conflict do nothing;

insert into models (id, series_id, name, sku, has_glass, trim) values
  ('57c6b14c-e530-479a-ae77-d5759ceae04e', '219d3786-c3dd-4644-8000-cbee2b27d656', 'Элегант 1',                        'ELEGANT-WOOD-1',              false, null),
  ('f36195c8-01df-4162-972b-e85414b4bba4', '219d3786-c3dd-4644-8000-cbee2b27d656', 'Элегант 1 Кристалл Линия стекло', 'ELEGANT-WOOD-1-CRYSTAL-LINE', true,  null),
  ('14381cbe-25ab-4df1-97ea-c0030da4db10', '219d3786-c3dd-4644-8000-cbee2b27d656', 'Элегант 2',                        'ELEGANT-WOOD-2',              false, null),
  ('41a5f15e-0a78-4518-bb74-bd8889943666', '219d3786-c3dd-4644-8000-cbee2b27d656', 'Элегант 3',                        'ELEGANT-WOOD-3',              false, null)
on conflict do nothing;

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  -- Дуб красный
  ('57c6b14c-e530-479a-ae77-d5759ceae04e', '0022d03a-83f3-48d4-8092-faa5bd9dc3ff', 9060, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_1_red_oak.webp'),
  ('f36195c8-01df-4162-972b-e85414b4bba4', '0022d03a-83f3-48d4-8092-faa5bd9dc3ff', 9540, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_1_red_oak_crystal_line.webp'),
  ('14381cbe-25ab-4df1-97ea-c0030da4db10', '0022d03a-83f3-48d4-8092-faa5bd9dc3ff', 9060, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_2_red_oak.webp'),
  ('41a5f15e-0a78-4518-bb74-bd8889943666', '0022d03a-83f3-48d4-8092-faa5bd9dc3ff', 9060, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_3_red_oak.webp'),
  -- Дуб арктический
  ('57c6b14c-e530-479a-ae77-d5759ceae04e', '9d691ee7-50db-46ea-a7f4-a020bbdf5092', 9060, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_1_arctic_oak.webp'),
  ('f36195c8-01df-4162-972b-e85414b4bba4', '9d691ee7-50db-46ea-a7f4-a020bbdf5092', 9540, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_1_arctic_oak_crystal_line.webp'),
  ('14381cbe-25ab-4df1-97ea-c0030da4db10', '9d691ee7-50db-46ea-a7f4-a020bbdf5092', 9060, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_2_arctic_oak.webp'),
  ('41a5f15e-0a78-4518-bb74-bd8889943666', '9d691ee7-50db-46ea-a7f4-a020bbdf5092', 9060, 'https://storage.yandexcloud.net/vfd74ru/catalog/elegant_wood/elegant_3_arctic_oak.webp')
on conflict do nothing;

commit;

-- Проверка: должно вернуть 8 строк
-- select m.name, c.name, mc.price_rrp
-- from model_colors mc
-- join models m on m.id = mc.model_id
-- join colors c on c.id = mc.color_id
-- where m.series_id = '219d3786-c3dd-4644-8000-cbee2b27d656'
-- order by c.name, m.name;
