#!/usr/bin/env bash
# Let's Encrypt certificate auto-renewal
# Add to root crontab: 0 3 * * * /opt/football/scripts/ssl-renew.sh >> /var/log/football/ssl-renew.log 2>&1
set -euo pipefail

DOMAIN="${SSL_DOMAIN:-football.ir}"
COMPOSE_FILE="/opt/football/docker/docker-compose.prod.yml"

certbot renew \
  --quiet \
  --standalone \
  --pre-hook  "docker compose -f ${COMPOSE_FILE} stop nginx" \
  --post-hook "
    docker run --rm \
      -v nginx_ssl:/ssl \
      -v /etc/letsencrypt/live/${DOMAIN}:/certs:ro \
      alpine sh -c 'cp /certs/fullchain.pem /ssl/ && cp /certs/privkey.pem /ssl/ && chmod 644 /ssl/*.pem' && \
    docker compose -f ${COMPOSE_FILE} start nginx
  "

echo "[$(date)] SSL renewal check complete"
