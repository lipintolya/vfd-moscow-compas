# Фото основателя для слайдера на обложке `/about/`

Фото от владельца (18.10.2026), 2 кадра 853×1280, фон прозрачный (кадр
ложится на тёмную плитку обложки). Первый кадр слайдера — студийный
портрет, он не здесь: `scripts/gen-about-images.mjs` (`founder-400/640`).

`npm run gen:photos` → `public/renders/about/founder-N-<хеш>-{480,853}.webp`
и `src/data/founder-photos.json`. Подписи — `FOUNDER_SLIDE_ALTS` в
`src/data/about-page.ts`, пауза между кадрами — `FOUNDER_SLIDE_INTERVAL`.
