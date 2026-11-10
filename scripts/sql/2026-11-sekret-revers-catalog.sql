-- Скрытые двери «Секрет Реверс» (обратное открывание) в общем каталоге:
-- полотно «Финиш-грунт», кромка чёрная (BE 4x4) — две карточки по коробу.
--
-- Запуск: Supabase → SQL Editor → вставить файл целиком → Run.
-- Повторный запуск безопасен (on conflict do nothing).
--
-- Серия, покрытие и цвет уже созданы (2026-11-sekret-catalog.sql).
-- ЦЕНЫ на сайте — из src/data/skrytye-dveri-products.ts (не price_rrp):
-- по акции до 31.12.2026 полотно 14 330 ₽, с коробом Стандарт 32 170 ₽,
-- Лайт 26 790 ₽; после — 15 910 / 35 730 / 28 370 ₽. price_rrp — обычная.
-- Связь с прайсом — src/lib/hidden-doors-catalog.ts (HIDDEN_MODELS).
-- Фото: public/media/invisible/secret_revers.webp.

begin;

insert into models (id, series_id, name, sku, has_glass, trim) values
  ('1476c27f-8830-4a8d-9219-3ea83474cc95', 'd805f916-afd8-476e-abb2-93c9cc49ba0d', 'Секрет Реверс Стандарт', 'SEKRET-REVERS-BE-STANDARD', false, 'BE 4x4'),
  ('ca0c7421-f0f4-4a90-afe9-554e87c27b87', 'd805f916-afd8-476e-abb2-93c9cc49ba0d', 'Секрет Реверс Лайт',     'SEKRET-REVERS-BE-LITE',     false, 'BE 4x4')
on conflict do nothing;

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  ('1476c27f-8830-4a8d-9219-3ea83474cc95', '23bf1f50-02af-4eef-b40c-d750f08d2475', 15910, 'https://storage.yandexcloud.net/catalog-vfd/invisible/secret_revers.webp'),
  ('ca0c7421-f0f4-4a90-afe9-554e87c27b87', '23bf1f50-02af-4eef-b40c-d750f08d2475', 15910, 'https://storage.yandexcloud.net/catalog-vfd/invisible/secret_revers.webp')
on conflict do nothing;

commit;

-- Проверка: должно вернуть 4 строки (2 прямых + 2 реверс)
-- select m.name, mc.price_rrp from model_colors mc join models m on m.id = mc.model_id
-- where m.series_id = 'd805f916-afd8-476e-abb2-93c9cc49ba0d';
