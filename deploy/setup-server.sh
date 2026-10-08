#!/bin/bash
# One-time server setup for domain-placeholder.example on Beget VPS.
# Run on the server as root:
#   bash setup-server.sh
set -euo pipefail

DOMAIN="domain-placeholder.example"
REPO_DIR="/var/repo/vfd-moscow-compas.git"
WORK_TREE="/var/www/domain-placeholder.example/build"
WEB_ROOT="/var/www/domain-placeholder.example/public"
NODE_VERSION="22"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Creating directories"
mkdir -p "$WORK_TREE" "$WEB_ROOT" "$(dirname "$REPO_DIR")"

echo "==> Initializing bare repository at $REPO_DIR"
if [ ! -d "$REPO_DIR" ]; then
  git init --bare "$REPO_DIR"
fi

echo "==> Installing post-receive hook"
install -m 755 "$SCRIPT_DIR/post-receive" "$REPO_DIR/hooks/post-receive"

echo "==> Installing nvm + Node.js $NODE_VERSION"
export NVM_DIR="/root/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install "$NODE_VERSION"
nvm alias default "$NODE_VERSION"
nvm use default

echo "==> Node $(node -v), npm $(npm -v)"

if [ ! -f "$WORK_TREE/.env.production" ]; then
  cat > "$WORK_TREE/.env.production" <<'EOF'
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
EOF
  echo "WARNING: Fill in $WORK_TREE/.env.production before the first deploy."
fi

if [ ! -f "/etc/nginx/sites-available/$DOMAIN" ]; then
  # ВАЖНО: certbot --nginx перезапишет этот файл при выпуске SSL-сертификата
  # и обычно объединяет www.$DOMAIN в тот же server_name без редиректа —
  # после certbot вручную добавь отдельный server{} с редиректом
  # www.$DOMAIN -> $DOMAIN (301), иначе оба домена будут отдавать один и тот
  # же контент как независимые сайты (дубли для поисковиков). Также проверь,
  # что try_files остаётся "=404" (не "/index.html" — SPA-фоллбек ломает
  # реальные коды 404 для несуществующих страниц).
  cat > "/etc/nginx/sites-available/$DOMAIN" <<NGINX
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    root $WEB_ROOT;
    index index.html;

    # Версию nginx не показываем в ответах и на страницах ошибок
    server_tokens off;

    # Заголовки безопасности. CSP проверена на всех типах страниц
    # (главная, «О нас», контакты, каталог, модель, видео, перегородки):
    # внешние — только фото/видео из Yandex Cloud, Яндекс Метрика и плееры
    # VK/Rutube. 'unsafe-inline' для скриптов нужен встроенным скриптам
    # Astro (запуск островов Vue, печать цитаты, баннер куки).
    # Добавили новый внешний сервис — допишите его домен сюда.
    # После выпуска SSL (certbot) добавьте в server { listen 443 … }:
    #   add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://mc.yandex.ru https://yastatic.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://storage.yandexcloud.net https://mc.yandex.ru https://mc.yandex.com; media-src 'self' https://storage.yandexcloud.net; font-src 'self'; connect-src 'self' https://mc.yandex.ru https://mc.yandex.com; frame-src https://vk.com https://vkvideo.ru https://rutube.ru https://mc.yandex.ru; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" always;

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Файлы сборки с хешем в имени и шрифты не меняются — кешируем на год.
    # add_header внутри location отменяет заголовки уровня server, поэтому
    # nosniff повторён здесь; остальные заголовки JS/CSS/шрифтам не нужны.
    location ^~ /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options "nosniff" always;
        try_files \$uri =404;
    }
    location ^~ /fonts/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options "nosniff" always;
        try_files \$uri =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
NGINX

  ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
  nginx -t
  systemctl reload nginx
  echo "==> Nginx config created for $DOMAIN"
else
  echo "==> Nginx config already exists, skipping"
fi

echo
echo "Setup complete."
echo "Next steps:"
echo "  1. Add your SSH public key to /root/.ssh/authorized_keys"
echo "  2. Edit $WORK_TREE/.env.production"
echo "  3. From your machine: git push production main"
