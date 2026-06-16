#!/usr/bin/env bash
# First-time Let's Encrypt SSL certificate setup
# Run once on the VPS after DNS is pointed at the server
# Usage: sudo bash scripts/ssl-setup.sh football.ir admin@football.ir
set -euo pipefail

DOMAIN="${1:?Usage: ssl-setup.sh DOMAIN EMAIL}"
EMAIL="${2:?Usage: ssl-setup.sh DOMAIN EMAIL}"
COMPOSE_FILE="docker/docker-compose.prod.yml"
APP_DIR="/opt/football"

# Ensure certbot is installed
if ! command -v certbot &>/dev/null; then
  echo "Installing certbot..."
  apt-get update -qq && apt-get install -y certbot
fi

echo "Stopping Nginx to free port 80 for certbot..."
docker compose -f "$COMPOSE_FILE" stop nginx

echo "Requesting certificate for $DOMAIN and www.$DOMAIN..."
certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

CERT_SRC="/etc/letsencrypt/live/$DOMAIN"
echo "Copying certificates into nginx_ssl volume..."
docker run --rm \
  -v nginx_ssl:/ssl \
  -v "$CERT_SRC":/certs:ro \
  alpine sh -c "cp /certs/fullchain.pem /ssl/ && cp /certs/privkey.pem /ssl/ && chmod 644 /ssl/*.pem"

echo "Starting Nginx..."
docker compose -f "$COMPOSE_FILE" start nginx

echo ""
echo "SSL certificates installed for $DOMAIN"
echo "Add auto-renewal to crontab:"
echo "  0 3 * * * ${APP_DIR}/scripts/ssl-renew.sh >> /var/log/football/ssl-renew.log 2>&1"
