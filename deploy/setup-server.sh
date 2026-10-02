#!/bin/bash
# One-time server setup for vfd74.ru on Beget VPS.
# Run on the server as root:
#   bash setup-server.sh
set -euo pipefail

DOMAIN="vfd74.ru"
REPO_DIR="/var/repo/vfd74.git"
WORK_TREE="/var/www/vfd74.ru/build"
WEB_ROOT="/var/www/vfd74.ru/public"
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

    location / {
        try_files \$uri \$uri/ =404;
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
