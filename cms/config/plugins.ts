import type { Core } from '@strapi/strapi';

/** Самый большой файл, который примет медиатека (фото с телефона) */
export const UPLOAD_LIMIT = 25 * 1024 * 1024;

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedTypes = [
  'image/svg+xml',
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  /* Медиатека: Strapi при загрузке делает уменьшенные копии — сайт берёт
     подходящую под экран (src/lib/strapi.ts → strapiImage). Фото с телефона
     (до 25 МБ) принимаем — на сайт уходят копии, не оригинал. */
  upload: {
    config: {
      sizeLimit: UPLOAD_LIMIT,
      breakpoints: { xlarge: 1920, large: 1280, medium: 960, small: 640 },
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
