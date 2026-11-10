-- Эмалекс: недостающие цвета моделей (без дублей) — 15 реальных рендеров
-- фабрики (vfd-74.ru / vfd-ural.ru) + перекраска моделей Урбан и Штрих.
-- Запуск: Supabase → SQL Editor → Run. Повтор безопасен (on conflict do nothing).
-- Фото: public/media/emalex/colors/. Цена — цена модели (у Эмалекса нет надбавки за цвет).

begin;

insert into model_colors (model_id, color_id, price_rrp, photo_url) values
  ('51c84310-5c40-4b52-87bf-69a7e690ed8f', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2v_emalex_taupe_be.webp'),  -- Урбан 2ВР BM 4x4 · бежевый · фабрика
  ('48ab6a52-5711-4f47-b4d0-80e603029304', '5d553c8d-8244-451e-81e5-25341362347b', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2v_emalex_ice_se_4x4.webp'),  -- Урбан 2ВР SE 4x4 · белый · фабрика
  ('6eb6542a-0b9b-472e-b5f0-0680fa2de741', '2f22c603-8a85-409c-a1f9-3b83403e7869', 13360, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_z_emalex_midwhite_be_4x4.webp'),  -- Урбан ЗТ BE 4x4 · молочный · фабрика
  ('9ff49fa7-1b36-4b0c-aabf-457cb990d5c0', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 8030, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/ec2_emalex_taupe.webp'),  -- ЕС2  · бежевый · фабрика
  ('8ad75881-fb46-439e-afce-5eaae9ca01b3', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 8500, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/ec2_emalex_taupe_crystal_cloud.webp'),  -- ЕС2 Кристалл Кросс стекло  · бежевый · фабрика
  ('94e0b3b0-e537-4617-a9dc-11adbb0bfeea', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er1_emalex_taupe.webp'),  -- ЕР1  · бежевый · фабрика
  ('94911a42-95a2-448b-990e-d78e21860a5e', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 9790, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er2_emalex_taupe_white_cloud.webp'),  -- ЕР2 Сатин Белый стекло  · бежевый · фабрика
  ('1b2799fe-3a14-4aa8-bb3e-20d3dc931f19', '5d553c8d-8244-451e-81e5-25341362347b', 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_3_emalex_ice.webp'),  -- Элегант 3  · белый · фабрика
  ('5eedfe61-3346-4fb9-91b5-c5a5dba20bd6', 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668', 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emalex_33_emalex_onyx_black_gloss.webp'),  -- Эмалекс 33 Лакобель Черный стекло  · графит · фабрика
  ('5eedfe61-3346-4fb9-91b5-c5a5dba20bd6', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emalex_33_emalex_steel_black_gloss.webp'),  -- Эмалекс 33 Лакобель Черный стекло  · серый · фабрика
  ('5eedfe61-3346-4fb9-91b5-c5a5dba20bd6', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emalex_33_emalex_taupe_black_gloss.webp'),  -- Эмалекс 33 Лакобель Черный стекло  · бежевый · фабрика
  ('e2092bce-a03c-4649-a140-327b0f76a4d6', 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668', 7030, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emalex_28_emalex_onyx_black_gloss.webp'),  -- Эмалекс 28 Лакобель Черный стекло  · графит · фабрика
  ('6b07a18a-704c-4691-8d52-d8bf0a119c73', '2f22c603-8a85-409c-a1f9-3b83403e7869', 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emalex_2_fly_emalex_midwhite.webp'),  -- E2 Флай Сатин Белый стекло  · молочный · фабрика
  ('1a8a7707-09bf-4b46-9fb5-8b1e719b8732', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 9400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/basic_emalex_steel_abs_onyx.webp'),  -- Бейсик ЗТ АБС Onyx · серый · фабрика
  ('33d1f0f7-f175-410e-812c-708938992a63', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 10910, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/basic_1v_emalex_steel_abs_black_bm.webp'),  -- Бейсик 1ВР АБС Black BM · серый · фабрика
  ('98075687-faee-463e-ba2f-20f089ee0b5f', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14450, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1_be_emalex_midwhite.webp'),  -- Урбан 1 BE 4x4 · молочный · перекраска
  ('3bd14fc3-8376-4533-97b7-bf49f8d06bd6', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14450, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1_gm_emalex_midwhite.webp'),  -- Урбан 1 GM 4x4 · молочный · перекраска
  ('3bd14fc3-8376-4533-97b7-bf49f8d06bd6', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 14450, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1_gm_emalex_steel.webp'),  -- Урбан 1 GM 4x4 · серый · перекраска
  ('c6ffb661-2f6e-4c25-8155-f28fdf36424d', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1vr_bm_emalex_taupe.webp'),  -- Урбан 1ВР BM 4x4 · бежевый · перекраска
  ('c6ffb661-2f6e-4c25-8155-f28fdf36424d', 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1vr_bm_emalex_onyx.webp'),  -- Урбан 1ВР BM 4x4 · графит · перекраска
  ('51a5abb6-e325-4377-a5ff-3acc58f2b0cd', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1vr_gm_emalex_taupe.webp'),  -- Урбан 1ВР GM 4x4 · бежевый · перекраска
  ('51a5abb6-e325-4377-a5ff-3acc58f2b0cd', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1vr_gm_emalex_steel.webp'),  -- Урбан 1ВР GM 4x4 · серый · перекраска
  ('01af8fbf-b48d-4451-b3dc-6d1276db6be8', '5d553c8d-8244-451e-81e5-25341362347b', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1vr_sm_emalex_ice.webp'),  -- Урбан 1ВР SM 4x4 · белый · перекраска
  ('01af8fbf-b48d-4451-b3dc-6d1276db6be8', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1vr_sm_emalex_midwhite.webp'),  -- Урбан 1ВР SM 4x4 · молочный · перекраска
  ('01af8fbf-b48d-4451-b3dc-6d1276db6be8', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1vr_sm_emalex_steel.webp'),  -- Урбан 1ВР SM 4x4 · серый · перекраска
  ('51c84310-5c40-4b52-87bf-69a7e690ed8f', '5d553c8d-8244-451e-81e5-25341362347b', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2vr_bm_emalex_ice.webp'),  -- Урбан 2ВР BM 4x4 · белый · перекраска
  ('51c84310-5c40-4b52-87bf-69a7e690ed8f', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2vr_bm_emalex_midwhite.webp'),  -- Урбан 2ВР BM 4x4 · молочный · перекраска
  ('8588af86-eb0f-4a8b-b3a0-d2a13c9118cb', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2vr_gm_emalex_steel.webp'),  -- Урбан 2ВР GM 4x4 · серый · перекраска
  ('13eb7ac0-e7eb-42a2-95db-d6404354e631', '5d553c8d-8244-451e-81e5-25341362347b', 12000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_ge_emalex_ice.webp'),  -- Урбан ЗТ GE 4x4 · белый · перекраска
  ('13eb7ac0-e7eb-42a2-95db-d6404354e631', '2f22c603-8a85-409c-a1f9-3b83403e7869', 12000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_ge_emalex_midwhite.webp'),  -- Урбан ЗТ GE 4x4 · молочный · перекраска
  ('13eb7ac0-e7eb-42a2-95db-d6404354e631', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 12000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_ge_emalex_steel.webp'),  -- Урбан ЗТ GE 4x4 · серый · перекраска
  ('13eb7ac0-e7eb-42a2-95db-d6404354e631', 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668', 12000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_ge_emalex_onyx.webp'),  -- Урбан ЗТ GE 4x4 · графит · перекраска
  ('6eb6542a-0b9b-472e-b5f0-0680fa2de741', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 13360, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_be_emalex_taupe.webp'),  -- Урбан ЗТ BE 4x4 · бежевый · перекраска
  ('a1f407f4-f39b-4c01-85a6-47c1ce030d9d', '5d553c8d-8244-451e-81e5-25341362347b', 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2gr_sm_emalex_ice.webp'),  -- Урбан 2ГР SM 4x4 · белый · перекраска
  ('a1f407f4-f39b-4c01-85a6-47c1ce030d9d', '2f22c603-8a85-409c-a1f9-3b83403e7869', 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2gr_sm_emalex_midwhite.webp'),  -- Урбан 2ГР SM 4x4 · молочный · перекраска
  ('a1f407f4-f39b-4c01-85a6-47c1ce030d9d', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2gr_sm_emalex_steel.webp'),  -- Урбан 2ГР SM 4x4 · серый · перекраска
  ('a2d505d8-9e35-455f-af56-23be775b8815', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2gr_bm_emalex_taupe.webp'),  -- Урбан 2ГР BM 4x4 · бежевый · перекраска
  ('a2d505d8-9e35-455f-af56-23be775b8815', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2gr_bm_emalex_steel.webp'),  -- Урбан 2ГР BM 4x4 · серый · перекраска
  ('a2d505d8-9e35-455f-af56-23be775b8815', 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668', 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2gr_bm_emalex_onyx.webp'),  -- Урбан 2ГР BM 4x4 · графит · перекраска
  ('137989d9-23b8-4765-9d4d-020835b8df69', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 13220, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2gr_gm_emalex_steel.webp'),  -- Урбан 2ГР GM 4x4 · серый · перекраска
  ('6d5ade72-451e-48cb-85c3-87c7eba56c4b', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1sv_be_emalex_midwhite.webp'),  -- Урбан 1СВ BE 4x4 · молочный · перекраска
  ('6d5ade72-451e-48cb-85c3-87c7eba56c4b', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 14720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1sv_be_emalex_taupe.webp'),  -- Урбан 1СВ BE 4x4 · бежевый · перекраска
  ('995347e7-1be6-4a25-bb6c-01f7d44ee86d', '5d553c8d-8244-451e-81e5-25341362347b', 14720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1sv_ge_emalex_ice.webp'),  -- Урбан 1СВ GE 4x4 · белый · перекраска
  ('995347e7-1be6-4a25-bb6c-01f7d44ee86d', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1sv_ge_emalex_midwhite.webp'),  -- Урбан 1СВ GE 4x4 · молочный · перекраска
  ('7434f55c-b2a8-4f12-b0c6-56c7c57888eb', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14300, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/shtrih_2a_bm_emalex_midwhite.webp'),  -- Штрих 2А Чёрная с молдингом · молочный · перекраска
  ('78543d40-b617-4976-809e-06bc22c61fc1', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 14300, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/shtrih_2a_gm_emalex_taupe.webp'),  -- Штрих 2А Золотая с молдингом · бежевый · перекраска
  ('78543d40-b617-4976-809e-06bc22c61fc1', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 14300, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/shtrih_2a_gm_emalex_steel.webp'),  -- Штрих 2А Золотая с молдингом · серый · перекраска
  ('ca198b3a-764d-4c6e-86b0-e5cb3473dab8', '2f22c603-8a85-409c-a1f9-3b83403e7869', 14300, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/shtrih_1_bm_emalex_midwhite.webp'),  -- Штрих 1 Чёрная с молдингом · молочный · перекраска
  ('59aa5754-41d7-4ff7-b7ee-7f5a602daa7a', 'cf72844d-5ac7-4452-93a8-fe3d2e06dded', 14300, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/shtrih_1_gm_emalex_taupe.webp'),  -- Штрих 1 Золотая с молдингом · бежевый · перекраска
  ('59aa5754-41d7-4ff7-b7ee-7f5a602daa7a', 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291', 14300, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/shtrih_1_gm_emalex_steel.webp')   -- Штрих 1 Золотая с молдингом · серый · перекраска
on conflict do nothing;

commit;

-- Проверка: select count(*) from model_colors where photo_url like '%/emalex/colors/%';  -- должно быть 50
