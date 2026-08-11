#!/usr/bin/env bash
set -Eeuo pipefail

: "${API_URL:=http://127.0.0.1:3001}"
: "${WEB_URL:=http://127.0.0.1:8080}"
: "${DASHBOARD_URL:=http://127.0.0.1:8081}"

curl -fsS "$API_URL/health" >/dev/null
curl -fsS "$API_URL/health/ready" >/dev/null
curl -fsS "$WEB_URL/healthz" >/dev/null
curl -fsS "$DASHBOARD_URL/healthz" >/dev/null

echo "PMMI health checks passed"
