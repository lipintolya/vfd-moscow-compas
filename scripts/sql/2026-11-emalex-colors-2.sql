-- Эмалекс, второй этап: недостающие цвета серий Бейсик, Эмалекс, Элегант,
-- Эмалекс Модерн — 87 перекрасок (стекло и фурнитура сохранены, ручка —
-- с настоящего кадра фабрики в цвете полотна).
-- Следующим этапом: Урбан SE, Элегант 3, Эмалекс 28/34 Лакобель,
-- E1 Флай Сатин Графит, ЕР1 Сатин Графит.
-- Запуск: Supabase → SQL Editor → Run. Повтор безопасен: строка добавляется,
-- только если у модели ещё нет этого цвета (дублей не будет).
-- Фото: public/media/emalex/colors/. Цена — цена модели (у Эмалекса нет надбавки за цвет).

begin;

insert into model_colors (model_id, color_id, price_rrp, photo_url)
select v.model_id, v.color_id, v.price_rrp, v.photo_url
from (values
  ('d4080602-5358-48ff-a964-3187a8353fb2'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_zt_abs_black_emalex_ice.webp'),  -- Бейсик ЗТ АБС Black · белый
  ('d4080602-5358-48ff-a964-3187a8353fb2'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_zt_abs_black_emalex_midwhite.webp'),  -- Бейсик ЗТ АБС Black · молочный
  ('d4080602-5358-48ff-a964-3187a8353fb2'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_zt_abs_black_emalex_steel.webp'),  -- Бейсик ЗТ АБС Black · серый
  ('d4080602-5358-48ff-a964-3187a8353fb2'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_zt_abs_black_emalex_onyx.webp'),  -- Бейсик ЗТ АБС Black · графит
  ('1a8a7707-09bf-4b46-9fb5-8b1e719b8732'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_zt_abs_onyx_emalex_ice.webp'),  -- Бейсик ЗТ АБС Onyx · белый
  ('1a8a7707-09bf-4b46-9fb5-8b1e719b8732'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_zt_abs_onyx_emalex_midwhite.webp'),  -- Бейсик ЗТ АБС Onyx · молочный
  ('1a8a7707-09bf-4b46-9fb5-8b1e719b8732'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_zt_abs_onyx_emalex_taupe.webp'),  -- Бейсик ЗТ АБС Onyx · бежевый
  ('31f01ae9-e85e-4429-8db0-b903f0bf19cf'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 10230, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_1_abs_black_sm_emalex_midwhite.webp'),  -- Бейсик 1 АБС Black SM · молочный
  ('31f01ae9-e85e-4429-8db0-b903f0bf19cf'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 10230, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_1_abs_black_sm_emalex_taupe.webp'),  -- Бейсик 1 АБС Black SM · бежевый
  ('31f01ae9-e85e-4429-8db0-b903f0bf19cf'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 10230, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/beysik_1_abs_black_sm_emalex_steel.webp'),  -- Бейсик 1 АБС Black SM · серый
  ('6ce3b4d3-6222-4629-99e6-98fe7752a590'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er1_satin_belyy_steklo_emalex_onyx.webp'),  -- ЕР1 Сатин Белый стекло · графит
  ('94911a42-95a2-448b-990e-d78e21860a5e'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 9790, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er2_satin_belyy_steklo_emalex_onyx.webp'),  -- ЕР2 Сатин Белый стекло · графит
  ('8c0e6619-087b-4c53-8d9f-bd2441f55a27'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 9790, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er2_satin_grafit_steklo_emalex_ice.webp'),  -- ЕР2 Сатин Графит стекло · белый
  ('8c0e6619-087b-4c53-8d9f-bd2441f55a27'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 9790, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er2_satin_grafit_steklo_emalex_midwhite.webp'),  -- ЕР2 Сатин Графит стекло · молочный
  ('8c0e6619-087b-4c53-8d9f-bd2441f55a27'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 9790, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er2_satin_grafit_steklo_emalex_taupe.webp'),  -- ЕР2 Сатин Графит стекло · бежевый
  ('8c0e6619-087b-4c53-8d9f-bd2441f55a27'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 9790, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er2_satin_grafit_steklo_emalex_steel.webp'),  -- ЕР2 Сатин Графит стекло · серый
  ('2908d496-d86b-4e1f-ba66-ba4eae2fd459'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 11570, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_emalex_midwhite.webp'),  -- E1 · молочный
  ('2908d496-d86b-4e1f-ba66-ba4eae2fd459'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 11570, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_emalex_taupe.webp'),  -- E1 · бежевый
  ('2908d496-d86b-4e1f-ba66-ba4eae2fd459'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 11570, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_emalex_steel.webp'),  -- E1 · серый
  ('2908d496-d86b-4e1f-ba66-ba4eae2fd459'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 11570, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_emalex_onyx.webp'),  -- E1 · графит
  ('9d172d73-802d-4678-a6eb-53b0bbf1e2a0'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 12070, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_kristall_kross_steklo_emalex_midwhite.webp'),  -- E1 Кристалл Кросс стекло · молочный
  ('9d172d73-802d-4678-a6eb-53b0bbf1e2a0'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 12070, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_kristall_kross_steklo_emalex_taupe.webp'),  -- E1 Кристалл Кросс стекло · бежевый
  ('9d172d73-802d-4678-a6eb-53b0bbf1e2a0'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 12070, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_kristall_kross_steklo_emalex_steel.webp'),  -- E1 Кристалл Кросс стекло · серый
  ('9d172d73-802d-4678-a6eb-53b0bbf1e2a0'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 12070, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_kristall_kross_steklo_emalex_onyx.webp'),  -- E1 Кристалл Кросс стекло · графит
  ('f0262e74-c096-4df1-9a25-ab77c8a98adc'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 11570, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_emalex_midwhite.webp'),  -- E2 · молочный
  ('f0262e74-c096-4df1-9a25-ab77c8a98adc'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 11570, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_emalex_taupe.webp'),  -- E2 · бежевый
  ('f0262e74-c096-4df1-9a25-ab77c8a98adc'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 11570, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_emalex_onyx.webp'),  -- E2 · графит
  ('f96a73a6-bfa8-485c-9aad-0121778c4a1a'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 12070, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_kristall_kross_steklo_emalex_midwhite.webp'),  -- E2 Кристалл Кросс стекло · молочный
  ('f96a73a6-bfa8-485c-9aad-0121778c4a1a'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 12070, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_kristall_kross_steklo_emalex_taupe.webp'),  -- E2 Кристалл Кросс стекло · бежевый
  ('f96a73a6-bfa8-485c-9aad-0121778c4a1a'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 12070, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_kristall_kross_steklo_emalex_onyx.webp'),  -- E2 Кристалл Кросс стекло · графит
  ('a81b7493-d3ed-4806-a8c7-9625f467e0a7'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 12310, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_emalex_midwhite.webp'),  -- E3 · молочный
  ('a81b7493-d3ed-4806-a8c7-9625f467e0a7'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 12310, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_emalex_taupe.webp'),  -- E3 · бежевый
  ('a81b7493-d3ed-4806-a8c7-9625f467e0a7'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 12310, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_emalex_steel.webp'),  -- E3 · серый
  ('a81b7493-d3ed-4806-a8c7-9625f467e0a7'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 12310, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_emalex_onyx.webp'),  -- E3 · графит
  ('d8ee682d-7607-4e6e-8ae9-e08de2799888'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 12800, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_kristall_kross_steklo_emalex_midwhite.webp'),  -- E3 Кристалл Кросс стекло · молочный
  ('d8ee682d-7607-4e6e-8ae9-e08de2799888'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 12800, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_kristall_kross_steklo_emalex_taupe.webp'),  -- E3 Кристалл Кросс стекло · бежевый
  ('d8ee682d-7607-4e6e-8ae9-e08de2799888'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 12800, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_kristall_kross_steklo_emalex_steel.webp'),  -- E3 Кристалл Кросс стекло · серый
  ('d8ee682d-7607-4e6e-8ae9-e08de2799888'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 12800, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e3_kristall_kross_steklo_emalex_onyx.webp'),  -- E3 Кристалл Кросс стекло · графит
  ('4961c429-e2f6-48b2-928d-e84cbce66e1b'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_belyy_steklo_emalex_midwhite.webp'),  -- E1 Флай Сатин Белый стекло · молочный
  ('4961c429-e2f6-48b2-928d-e84cbce66e1b'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_belyy_steklo_emalex_taupe.webp'),  -- E1 Флай Сатин Белый стекло · бежевый
  ('4961c429-e2f6-48b2-928d-e84cbce66e1b'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_belyy_steklo_emalex_steel.webp'),  -- E1 Флай Сатин Белый стекло · серый
  ('4961c429-e2f6-48b2-928d-e84cbce66e1b'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_belyy_steklo_emalex_onyx.webp'),  -- E1 Флай Сатин Белый стекло · графит
  ('6b07a18a-704c-4691-8d52-d8bf0a119c73'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_flay_satin_belyy_steklo_emalex_taupe.webp'),  -- E2 Флай Сатин Белый стекло · бежевый
  ('6b07a18a-704c-4691-8d52-d8bf0a119c73'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e2_flay_satin_belyy_steklo_emalex_onyx.webp'),  -- E2 Флай Сатин Белый стекло · графит
  ('0ee13c9d-c6ea-4a32-93d4-5336f7fb10fb'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_emalex_midwhite.webp'),  -- Элегант 1 · молочный
  ('0ee13c9d-c6ea-4a32-93d4-5336f7fb10fb'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_emalex_taupe.webp'),  -- Элегант 1 · бежевый
  ('0ee13c9d-c6ea-4a32-93d4-5336f7fb10fb'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_emalex_steel.webp'),  -- Элегант 1 · серый
  ('0ee13c9d-c6ea-4a32-93d4-5336f7fb10fb'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_emalex_onyx.webp'),  -- Элегант 1 · графит
  ('298d96f9-0913-491f-97bd-526a5bf0e598'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_emalex_taupe.webp'),  -- Элегант 2 · бежевый
  ('298d96f9-0913-491f-97bd-526a5bf0e598'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_emalex_steel.webp'),  -- Элегант 2 · серый
  ('298d96f9-0913-491f-97bd-526a5bf0e598'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_emalex_onyx.webp'),  -- Элегант 2 · графит
  ('ff8df979-7adb-404f-87df-6eb8e80356e2'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_vr_emalex_ice.webp'),  -- Элегант 2 ВР · белый
  ('ff8df979-7adb-404f-87df-6eb8e80356e2'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_vr_emalex_taupe.webp'),  -- Элегант 2 ВР · бежевый
  ('0c8d7c8c-1e06-400e-ba72-3914a06ea007'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_flay_satin_belyy_steklo_emalex_midwhite.webp'),  -- Элегант 1 Флай Сатин Белый стекло · молочный
  ('0c8d7c8c-1e06-400e-ba72-3914a06ea007'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_flay_satin_belyy_steklo_emalex_taupe.webp'),  -- Элегант 1 Флай Сатин Белый стекло · бежевый
  ('0c8d7c8c-1e06-400e-ba72-3914a06ea007'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_flay_satin_belyy_steklo_emalex_steel.webp'),  -- Элегант 1 Флай Сатин Белый стекло · серый
  ('0c8d7c8c-1e06-400e-ba72-3914a06ea007'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_1_flay_satin_belyy_steklo_emalex_onyx.webp'),  -- Элегант 1 Флай Сатин Белый стекло · графит
  ('89ee25a6-2b45-4514-8ff0-9c43731123e4'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_flay_satin_belyy_steklo_emalex_midwhite.webp'),  -- Элегант 2 Флай Сатин Белый стекло · молочный
  ('89ee25a6-2b45-4514-8ff0-9c43731123e4'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_flay_satin_belyy_steklo_emalex_taupe.webp'),  -- Элегант 2 Флай Сатин Белый стекло · бежевый
  ('89ee25a6-2b45-4514-8ff0-9c43731123e4'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_flay_satin_belyy_steklo_emalex_steel.webp'),  -- Элегант 2 Флай Сатин Белый стекло · серый
  ('89ee25a6-2b45-4514-8ff0-9c43731123e4'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 12720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_flay_satin_belyy_steklo_emalex_onyx.webp'),  -- Элегант 2 Флай Сатин Белый стекло · графит
  ('b34b79c8-4485-4bb6-89c0-40b21a400c57'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 10690, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_satin_belyy_steklo_emalex_ice.webp'),  -- Элегант 2 Сатин Белый стекло · белый
  ('b34b79c8-4485-4bb6-89c0-40b21a400c57'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 10690, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_satin_belyy_steklo_emalex_taupe.webp'),  -- Элегант 2 Сатин Белый стекло · бежевый
  ('b34b79c8-4485-4bb6-89c0-40b21a400c57'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 10690, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_satin_belyy_steklo_emalex_steel.webp'),  -- Элегант 2 Сатин Белый стекло · серый
  ('b34b79c8-4485-4bb6-89c0-40b21a400c57'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 10690, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_2_satin_belyy_steklo_emalex_onyx.webp'),  -- Элегант 2 Сатин Белый стекло · графит
  ('51c06e62-08c1-412c-9a30-ab42dd3f0bc5'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 6530, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_27_satin_belyy_steklo_emalex_midwhite.webp'),  -- Эмалекс 27 Сатин Белый стекло · молочный
  ('51c06e62-08c1-412c-9a30-ab42dd3f0bc5'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 6530, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_27_satin_belyy_steklo_emalex_taupe.webp'),  -- Эмалекс 27 Сатин Белый стекло · бежевый
  ('51c06e62-08c1-412c-9a30-ab42dd3f0bc5'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 6530, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_27_satin_belyy_steklo_emalex_onyx.webp'),  -- Эмалекс 27 Сатин Белый стекло · графит
  ('6cd8aca8-cd45-4a53-93ac-58eb9640a04f'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 7030, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_27_lakobel_chernyy_steklo_emalex_midwhite.webp'),  -- Эмалекс 27 Лакобель Черный стекло · молочный
  ('6cd8aca8-cd45-4a53-93ac-58eb9640a04f'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 7030, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_27_lakobel_chernyy_steklo_emalex_taupe.webp'),  -- Эмалекс 27 Лакобель Черный стекло · бежевый
  ('6cd8aca8-cd45-4a53-93ac-58eb9640a04f'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 7030, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_27_lakobel_chernyy_steklo_emalex_onyx.webp'),  -- Эмалекс 27 Лакобель Черный стекло · графит
  ('60a12915-a47f-4579-92d4-cf3d534d367b'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 6530, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_28_satin_belyy_steklo_emalex_midwhite.webp'),  -- Эмалекс 28 Сатин Белый стекло · молочный
  ('60a12915-a47f-4579-92d4-cf3d534d367b'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 6530, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_28_satin_belyy_steklo_emalex_taupe.webp'),  -- Эмалекс 28 Сатин Белый стекло · бежевый
  ('60a12915-a47f-4579-92d4-cf3d534d367b'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 6530, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_28_satin_belyy_steklo_emalex_steel.webp'),  -- Эмалекс 28 Сатин Белый стекло · серый
  ('60a12915-a47f-4579-92d4-cf3d534d367b'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 6530, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_28_satin_belyy_steklo_emalex_onyx.webp'),  -- Эмалекс 28 Сатин Белый стекло · графит
  ('e85c7e0e-7b41-41f1-a556-e6611f3c2419'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 6860, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_32_emalex_midwhite.webp'),  -- Эмалекс 32 · молочный
  ('e85c7e0e-7b41-41f1-a556-e6611f3c2419'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 6860, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_32_emalex_taupe.webp'),  -- Эмалекс 32 · бежевый
  ('e85c7e0e-7b41-41f1-a556-e6611f3c2419'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 6860, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_32_emalex_steel.webp'),  -- Эмалекс 32 · серый
  ('e85c7e0e-7b41-41f1-a556-e6611f3c2419'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 6860, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_32_emalex_onyx.webp'),  -- Эмалекс 32 · графит
  ('0a218767-7f87-4b9b-90ca-aa7d384e01f9'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 6850, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_satin_belyy_steklo_emalex_midwhite.webp'),  -- Эмалекс 33 Сатин Белый стекло · молочный
  ('0a218767-7f87-4b9b-90ca-aa7d384e01f9'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 6850, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_satin_belyy_steklo_emalex_taupe.webp'),  -- Эмалекс 33 Сатин Белый стекло · бежевый
  ('0a218767-7f87-4b9b-90ca-aa7d384e01f9'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 6850, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_satin_belyy_steklo_emalex_steel.webp'),  -- Эмалекс 33 Сатин Белый стекло · серый
  ('0a218767-7f87-4b9b-90ca-aa7d384e01f9'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 6850, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_satin_belyy_steklo_emalex_onyx.webp'),  -- Эмалекс 33 Сатин Белый стекло · графит
  ('c66e3351-bc1d-4187-8203-2bcc60fc0a0f'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_satin_grafit_steklo_emalex_ice.webp'),  -- Эмалекс 33 Сатин Графит стекло · белый
  ('c66e3351-bc1d-4187-8203-2bcc60fc0a0f'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_satin_grafit_steklo_emalex_midwhite.webp'),  -- Эмалекс 33 Сатин Графит стекло · молочный
  ('c66e3351-bc1d-4187-8203-2bcc60fc0a0f'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_satin_grafit_steklo_emalex_steel.webp'),  -- Эмалекс 33 Сатин Графит стекло · серый
  ('5eedfe61-3346-4fb9-91b5-c5a5dba20bd6'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_33_lakobel_chernyy_steklo_emalex_midwhite.webp')   -- Эмалекс 33 Лакобель Черный стекло · молочный
) as v(model_id, color_id, price_rrp, photo_url)
where not exists (
  select 1 from model_colors mc
  where mc.model_id = v.model_id and mc.color_id = v.color_id
);

commit;

-- Проверка: select count(*) from model_colors where photo_url like '%/emalex/colors/%';  -- было 50, должно стать 137
