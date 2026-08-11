#!/usr/bin/env bash
set -euo pipefail
API="${PMMI_API_URL:-http://127.0.0.1:3001}"
DASHBOARD="${PMMI_DASHBOARD_URL:-http://127.0.0.1:3002}"
PUBLIC="${PMMI_PUBLIC_URL:-http://127.0.0.1:3000}"
EXTENSIONS="${PMMI_PUBLIC_EXTENSIONS_URL:-http://127.0.0.1:3003}"
WEBHOOKS="${PMMI_WEBHOOKS_URL:-http://127.0.0.1:3011}"
check(){ echo "checking $1 -> $2"; curl --fail --silent --show-error --max-time 10 "$2" >/dev/null; }
check api "$API/health"
check api-version "$API/v1"
check dashboard "$DASHBOARD/"
check public "$PUBLIC/"
check registration "$EXTENSIONS/daftar"
check portfolio "$EXTENSIONS/portfolio"
check webhooks "$WEBHOOKS/health"
echo "PMMI smoke test passed"
