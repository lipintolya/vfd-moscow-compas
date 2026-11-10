-- Эмалекс, третий этап: оставшиеся цвета — 28 перекрасок.
-- Урбан SE (кроме 2ВР SE графит — отдельно), Элегант 3, Эмалекс 28/34 Лакобель,
-- ЕР1 Сатин Графит и E1 Флай Сатин Графит в светлых цветах.
-- Запуск: Supabase → SQL Editor → Run. Повтор безопасен: строка добавляется,
-- только если у модели ещё нет этого цвета (дублей не будет).
-- Фото: public/media/emalex/colors/. Цена — цена модели (у Эмалекса нет надбавки за цвет).

begin;

insert into model_colors (model_id, color_id, price_rrp, photo_url)
select v.model_id, v.color_id, v.price_rrp, v.photo_url
from (values
  ('1b2799fe-3a14-4aa8-bb3e-20d3dc931f19'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_3_emalex_midwhite.webp'),  -- Элегант 3 · молочный
  ('1b2799fe-3a14-4aa8-bb3e-20d3dc931f19'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 10080, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/elegant_3_emalex_taupe.webp'),  -- Элегант 3 · бежевый
  ('e2092bce-a03c-4649-a140-327b0f76a4d6'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 7030, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_28_lakobel_chernyy_steklo_emalex_midwhite.webp'),  -- Эмалекс 28 Лакобель Черный стекло · молочный
  ('e2092bce-a03c-4649-a140-327b0f76a4d6'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 7030, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_28_lakobel_chernyy_steklo_emalex_taupe.webp'),  -- Эмалекс 28 Лакобель Черный стекло · бежевый
  ('398aa765-a1ed-4ee4-b9ee-dc3c3e9b1cb4'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_34_lakobel_chernyy_steklo_emalex_ice.webp'),  -- Эмалекс 34 Лакобель Черный стекло · белый
  ('398aa765-a1ed-4ee4-b9ee-dc3c3e9b1cb4'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_34_lakobel_chernyy_steklo_emalex_midwhite.webp'),  -- Эмалекс 34 Лакобель Черный стекло · молочный
  ('398aa765-a1ed-4ee4-b9ee-dc3c3e9b1cb4'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 7400, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/emaleks_34_lakobel_chernyy_steklo_emalex_taupe.webp'),  -- Эмалекс 34 Лакобель Черный стекло · бежевый
  ('60531f29-9d52-4755-b418-a303c0874c44'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 14450, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1_se_4x4_emalex_midwhite.webp'),  -- Урбан 1 SE 4x4 · молочный
  ('60531f29-9d52-4755-b418-a303c0874c44'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 14450, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1_se_4x4_emalex_taupe.webp'),  -- Урбан 1 SE 4x4 · бежевый
  ('60531f29-9d52-4755-b418-a303c0874c44'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 14450, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1_se_4x4_emalex_steel.webp'),  -- Урбан 1 SE 4x4 · серый
  ('60531f29-9d52-4755-b418-a303c0874c44'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 14450, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1_se_4x4_emalex_onyx.webp'),  -- Урбан 1 SE 4x4 · графит
  ('48ab6a52-5711-4f47-b4d0-80e603029304'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2vr_se_4x4_emalex_midwhite.webp'),  -- Урбан 2ВР SE 4x4 · молочный
  ('48ab6a52-5711-4f47-b4d0-80e603029304'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 14590, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_2vr_se_4x4_emalex_steel.webp'),  -- Урбан 2ВР SE 4x4 · серый
  ('36ff2bce-c3ac-438a-876d-4b0962193b5a'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 13360, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_se_4x4_emalex_midwhite.webp'),  -- Урбан ЗТ SE 4x4 · молочный
  ('36ff2bce-c3ac-438a-876d-4b0962193b5a'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 13360, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_se_4x4_emalex_taupe.webp'),  -- Урбан ЗТ SE 4x4 · бежевый
  ('36ff2bce-c3ac-438a-876d-4b0962193b5a'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 13360, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_se_4x4_emalex_steel.webp'),  -- Урбан ЗТ SE 4x4 · серый
  ('36ff2bce-c3ac-438a-876d-4b0962193b5a'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 13360, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_zt_se_4x4_emalex_onyx.webp'),  -- Урбан ЗТ SE 4x4 · графит
  ('b8271475-0980-460a-82ac-70f492b0eced'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 14720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1sv_se_4x4_emalex_midwhite.webp'),  -- Урбан 1СВ SE 4x4 · молочный
  ('b8271475-0980-460a-82ac-70f492b0eced'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 14720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1sv_se_4x4_emalex_steel.webp'),  -- Урбан 1СВ SE 4x4 · серый
  ('b8271475-0980-460a-82ac-70f492b0eced'::uuid, 'c54caca8-dba0-4dc1-8c5a-2c3683dd7668'::uuid, 14720, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/urban_1sv_se_4x4_emalex_onyx.webp'),  -- Урбан 1СВ SE 4x4 · графит
  ('999958ae-08da-4dbe-a0c9-5f5cc89bb6d5'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_grafit_steklo_emalex_ice.webp'),  -- E1 Флай Сатин Графит стекло · белый
  ('999958ae-08da-4dbe-a0c9-5f5cc89bb6d5'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_grafit_steklo_emalex_midwhite.webp'),  -- E1 Флай Сатин Графит стекло · молочный
  ('999958ae-08da-4dbe-a0c9-5f5cc89bb6d5'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_grafit_steklo_emalex_taupe.webp'),  -- E1 Флай Сатин Графит стекло · бежевый
  ('999958ae-08da-4dbe-a0c9-5f5cc89bb6d5'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 15990, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/e1_flay_satin_grafit_steklo_emalex_steel.webp'),  -- E1 Флай Сатин Графит стекло · серый
  ('21aa8a18-f79e-4504-979c-2186de9d973a'::uuid, '5d553c8d-8244-451e-81e5-25341362347b'::uuid, 10000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er1_satin_grafit_steklo_emalex_ice.webp'),  -- ЕР1 Сатин Графит стекло · белый
  ('21aa8a18-f79e-4504-979c-2186de9d973a'::uuid, '2f22c603-8a85-409c-a1f9-3b83403e7869'::uuid, 10000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er1_satin_grafit_steklo_emalex_midwhite.webp'),  -- ЕР1 Сатин Графит стекло · молочный
  ('21aa8a18-f79e-4504-979c-2186de9d973a'::uuid, 'cf72844d-5ac7-4452-93a8-fe3d2e06dded'::uuid, 10000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er1_satin_grafit_steklo_emalex_taupe.webp'),  -- ЕР1 Сатин Графит стекло · бежевый
  ('21aa8a18-f79e-4504-979c-2186de9d973a'::uuid, 'd3dbddd5-5b4b-414d-aa6b-bb8e8f88b291'::uuid, 10000, 'https://storage.yandexcloud.net/catalog-vfd/emalex/colors/er1_satin_grafit_steklo_emalex_steel.webp')   -- ЕР1 Сатин Графит стекло · серый
) as v(model_id, color_id, price_rrp, photo_url)
where not exists (
  select 1 from model_colors mc
  where mc.model_id = v.model_id and mc.color_id = v.color_id
);

commit;

-- Проверка: select count(*) from model_colors where photo_url like '%/emalex/colors/%';  -- было 137, должно стать 165
