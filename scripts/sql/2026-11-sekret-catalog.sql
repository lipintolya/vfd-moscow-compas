-- Скрытые двери «Секрет» в общем каталоге: полотно «Финиш-грунт» под покраску,
-- кромка чёрная (BE 4x4), прямое открывание — две карточки по типу короба:
-- «Секрет Стандарт» (алюминиевый короб) и «Секрет Лайт» (комбинированный).
--
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- Повторный запуск безопасен (on conflict do nothing).
--
-- ЦЕНЫ на сайте берутся НЕ из price_rrp, а из src/data/skrytye-dveri-products.ts
-- (тот же источник, что у /catalog/skrytye-dveri/), с акцией до 31.12.2026:
-- полотно 10 220 ₽, комплект Стандарт 28 060 ₽, Лайт 22 680 ₽. После акции —
-- 11 360 / 31 180 / 23 820 ₽ сами. price_rrp ниже — обычная цена, для справки.
-- Связь моделей с прайсом — src/lib/hidden-doors-catalog.ts (HIDDEN_MODELS).
--
-- Фото: public/media/invisible/secret.webp (ссылка ниже — по общему правилу
-- облачных путей, сборка берёт локальный файл).

begin;

insert into coatings (id, name, slug) values
  ('064ecbbb-9315-43cb-b805-995ab57cbf06', 'Финиш-грунт', 'finish-grunt')
on conflict do nothing;

insert into series (id, coating_id, name, slug) values
  ('d805f916-afd8-476e-abb2-93c9cc49ba0d', '064ecbbb-9315-43cb-b805-995ab57cbf06', 'Секрет', 'sekret')
on conflict do nothing;

insert into colors (id, coating_id, name, hex_preview) values
  ('23bf1f50-02af-4eef-b40c-d750f08d2475', '064ecbbb-9315-43cb-b805-995ab57cbf06', 'Финиш-грунт', '#ebe8e3')
on conflict do nothing;

insert into models (id, series_id, name, sku, has_glass, trim) values
  ('01da3484-3994-49d2-a25a-e3f79cb73575', 'd805f916-afd8-476e-abb2-93c9cc49ba0d', 'Секрет Стандарт', 'SEKRET-BE-STANDARD', false, 'BE 4x4'),
  ('b5580517-9dfa-46b9-9b86-29bdffeb82a0', 'd805f916-afd8-476e-abb2-93c9cc49ba0d', 'Секрет Лайт',     'SEKRET-BE-LITE',     false, 'BE 4x4')
on conflict do nothing;

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  ('01da3484-3994-49d2-a25a-e3f79cb73575', '23bf1f50-02af-4eef-b40c-d750f08d2475', 11360, 'https://storage.yandexcloud.net/catalog-vfd/invisible/secret.webp'),
  ('b5580517-9dfa-46b9-9b86-29bdffeb82a0', '23bf1f50-02af-4eef-b40c-d750f08d2475', 11360, 'https://storage.yandexcloud.net/catalog-vfd/invisible/secret.webp')
on conflict do nothing;

commit;

-- Проверка: должно вернуть 2 строки
-- select m.name, m.trim, c.name, mc.price_rrp
-- from model_colors mc
-- join models m on m.id = mc.model_id
-- join colors c on c.id = mc.color_id
-- where m.series_id = 'd805f916-afd8-476e-abb2-93c9cc49ba0d';
