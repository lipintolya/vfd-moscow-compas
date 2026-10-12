# Strapi — контент сайта для директора

Админка, в которой директор салона ведёт статьи, акции и портфолио. Как это делать — [инструкция для директора](../docs/director-guide.md). Интерфейс на русском.

```bash
npm run cms:install   # из корня проекта, первый раз
npm run cms           # админка: http://localhost:1337/admin
```

Как устроено и как сайт читает эти данные — в разделе «Strapi — контент для директора» основного [README](../README.md).

| Где | Что |
|---|---|
| `src/api/*`, `src/components/*` | разделы и поля (код, в Git) |
| `src/bootstrap/labels.ts` | русские подписи и подсказки полей |
| `src/bootstrap/access.ts` | права роли «Редактор», ключ сайта, вебхук разработки |
| `src/admin/translations/ru.json` | дописанный перевод Strapi; проверка — `npm run check:ru` |
| `scripts/import-works.mjs`, `scripts/import-articles.mjs` | разовый перенос работ и статей с прежнего сайта (выполнен) |
| `.tmp/`, `public/uploads/`, `.env` | база, загруженные фото, секреты — вне Git |
