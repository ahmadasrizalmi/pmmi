#!/usr/bin/env bash
set -Eeuo pipefail

: "${API_URL:=http://127.0.0.1:3001}"
: "${OPS_TOKEN:?OPS_TOKEN is required}"
: "${DISK_PATH:=/}"
: "${DISK_WARN_PERCENT:=85}"
: "${DISK_CRITICAL_PERCENT:=95}"
: "${NINE_ROUTER_URL:=http://127.0.0.1:20128}"

post_event() {
  local kind="$1" severity="$2" source="$3" message="$4" data="${5:-{}}"
  curl -fsS -X POST "$API_URL/v1/ops/events" \
    -H "x-ops-token: $OPS_TOKEN" \
    -H 'content-type: application/json' \
    --data "$(printf '{\"kind\":%s,\"severity\":%s,\"source\":%s,\"message\":%s,\"data\":%s}' "$(printf '%s' "$kind" | jq -Rs .)" "$(printf '%s' "$severity" | jq -Rs .)" "$(printf '%s' "$source" | jq -Rs .)" "$(printf '%s' "$message" | jq -Rs .)" "$data")" >/dev/null
}

for cmd in curl jq df; do command -v "$cmd" >/dev/null || { echo "Missing command: $cmd" >&2; exit 1; }; done

if ! curl -fsS --max-time 5 "$API_URL/health/ready" >/dev/null; then
  echo "PMMI API readiness failed" >&2
  exit 2
fi

usage="$(df -P "$DISK_PATH" | awk 'NR==2 {gsub(/%/,"",$5); print $5}')"
if [[ "$usage" -ge "$DISK_CRITICAL_PERCENT" ]]; then
  post_event storage.critical CRITICAL ops-monitor "PMMI disk usage is ${usage}%" "{\"path\":$(printf '%s' "$DISK_PATH" | jq -Rs .),\"usagePercent\":${usage}}"
elif [[ "$usage" -ge "$DISK_WARN_PERCENT" ]]; then
  post_event storage.warning WARN ops-monitor "PMMI disk usage is ${usage}%" "{\"path\":$(printf '%s' "$DISK_PATH" | jq -Rs .),\"usagePercent\":${usage}}"
fi

if ! curl -fsS --max-time 5 "$NINE_ROUTER_URL/v1/models" >/dev/null; then
  post_event 9router.unreachable ERROR ops-monitor "9Router is unreachable" "{\"url\":$(printf '%s' "$NINE_ROUTER_URL" | jq -Rs .)}"
fi

echo "PMMI ops monitor completed; disk=${usage}%"
