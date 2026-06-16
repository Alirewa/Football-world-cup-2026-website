#!/usr/bin/env bash
# Application health monitor — alerts via Kaveh Negar SMS after 3 consecutive failures
# Add to crontab: */5 * * * * /opt/football/scripts/health-check.sh
#
# Required env vars (source from /opt/football/.env or set in crontab):
#   NEXT_PUBLIC_APP_URL, KAVEH_NEGAR_API_KEY, ALERT_MOBILE

APP_URL="${NEXT_PUBLIC_APP_URL:-https://football.ir}"
ALERT_MOBILE="${ALERT_MOBILE:-09120000000}"
KN_API_KEY="${KAVEH_NEGAR_API_KEY:-}"
FAILURES_FILE="/tmp/football_health_failures"

check_health() {
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${APP_URL}/api/v1/health" 2>/dev/null)
  [ "$status" = "200" ]
}

if check_health; then
  # Healthy — reset failure counter
  rm -f "$FAILURES_FILE"
  exit 0
fi

# Count consecutive failures
FAILURES=1
if [ -f "$FAILURES_FILE" ]; then
  FAILURES=$(( $(cat "$FAILURES_FILE") + 1 ))
fi
echo "$FAILURES" > "$FAILURES_FILE"

echo "[$(date)] Health check FAILED (consecutive failures: $FAILURES)"

# Send SMS alert after 3 consecutive failures (~15 minutes of downtime)
if [ "$FAILURES" -ge 3 ] && [ -n "$KN_API_KEY" ]; then
  curl -s \
    "https://api.kavenegar.com/v1/${KN_API_KEY}/sms/send.json" \
    -d "receptor=${ALERT_MOBILE}&message=ALERT: football.ir is DOWN (${FAILURES} consecutive health check failures)" \
    > /dev/null
  echo "[$(date)] SMS alert sent to $ALERT_MOBILE"
fi

exit 1
