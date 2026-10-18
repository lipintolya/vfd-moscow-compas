#!/bin/bash
# Настройка сервера dveriziz.ru (Ubuntu 24.04) — статический сайт на nginx.
# Сайт собирается на компьютере разработчика (нужен Strapi) и выкладывается
# готовыми файлами: npm run deploy. На сервере нет ни Node.js, ни Strapi.
#
# Запуск — с компьютера разработчика, из корня проекта:
#   npm run server:setup            # пакеты, файрвол, nginx (http или https)
#   npm run server:setup -- --cert  # + выпустить HTTPS-сертификат
#                                   #   (когда dveriziz.ru указывает на сервер)
# Скрипт можно запускать повторно: он ничего не ломает и приводит
# конфигурацию к той, что в deploy/nginx/.
set -euo pipefail

DOMAIN="dveriziz.ru"
WEB_ROOT="/var/www/$DOMAIN/public"
ACME_ROOT="/var/www/letsencrypt"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

echo "==> Пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx certbot rsync fail2ban ufw unattended-upgrades >/dev/null

echo "==> Автообновления безопасности"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

echo "==> Файрвол: SSH, HTTP, HTTPS"
ufw allow OpenSSH >/dev/null
ufw allow "Nginx Full" >/dev/null
ufw --force enable >/dev/null

echo "==> Папки"
mkdir -p "$WEB_ROOT" "$ACME_ROOT"

echo "==> Настройки nginx"
install -m 644 "$HERE/nginx/headers.conf" /etc/nginx/snippets/dveriziz-headers.conf
install -m 644 "$HERE/nginx/site.conf"    /etc/nginx/snippets/dveriziz-site.conf
install -m 644 "$HERE/nginx/ssl.conf"     /etc/nginx/snippets/dveriziz-ssl.conf
rm -f /etc/nginx/sites-enabled/default

echo "==> Журналы nginx: 14 дней (срок из политики конфиденциальности)"
install -m 644 "$HERE/logrotate/nginx" /etc/logrotate.d/nginx

use_config() {
  install -m 644 "$1" "/etc/nginx/sites-available/$DOMAIN"
  ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
  nginx -t -q
  systemctl reload nginx
}

if [ ! -f "$CERT" ]; then
  use_config "$HERE/nginx/$DOMAIN.http.conf"
  echo "    http-версия (сертификата ещё нет)"
fi

if [ "${1:-}" = "--cert" ] && [ ! -f "$CERT" ]; then
  echo "==> HTTPS-сертификат Let's Encrypt"
  # Без почты: о продлении certbot позаботится сам (certbot.timer)
  certbot certonly --webroot -w "$ACME_ROOT" -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive --agree-tos --register-unsafely-without-email
fi

if [ -f "$CERT" ]; then
  # После продления сертификата nginx перечитывает его сам
  mkdir -p /etc/letsencrypt/renewal-hooks/deploy
  printf '#!/bin/sh\nsystemctl reload nginx\n' > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
  chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
  use_config "$HERE/nginx/$DOMAIN.conf"
  echo "    https-версия, сертификат до $(openssl x509 -enddate -noout -in "$CERT" | cut -d= -f2)"
fi

echo "==> Готово. Сайт выкладывается командой npm run deploy"
