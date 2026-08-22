#!/bin/bash
# G7 E2E part 1 — setup + admission chain via production domain
set -uo pipefail
API="https://ai.pondokmultimedia.id"
ADMIN_EMAIL="admin@pmmi.local"
ADMIN_PASS="masajidallah13"
USTADZ_EMAIL="ustadz-e2e@pmmi.local"
USTADZ_PASS="Ustadz12345!"
SANTRI_EMAIL="asrizalmi1+pmmitest3@gmail.com"
SANTRI_PASS="Santri12345!"
OUT=/tmp/e2e-part1.out
: > "$OUT"
j() { jq -r "$1" 2>/dev/null; }

echo "=== 0. admin login ===" | tee -a "$OUT"
ADMIN_TOKEN=$(curl -sk -X POST "$API/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" | j '.token')
echo "admin_token_len=${#ADMIN_TOKEN}" | tee -a "$OUT"

echo "=== 0b. ustadz (create if needed, else login) ===" | tee -a "$OUT"
USTADZ_ACT=$(curl -sk -X POST "$API/v1/admin/users" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d "{\"email\":\"$USTADZ_EMAIL\",\"fullName\":\"Ustadz E2E\",\"role\":\"USTADZ\",\"aiCredits\":25,\"hermesSlots\":1}" | j '.activationToken')
if [[ -n "$USTADZ_ACT" && "$USTADZ_ACT" != "null" ]]; then
  curl -sk -X POST "$API/v1/auth/activate" -H 'Content-Type: application/json' -d "{\"token\":\"$USTADZ_ACT\",\"password\":\"$USTADZ_PASS\"}" >/dev/null
  echo "ustadz created + activated" | tee -a "$OUT"
fi
USTADZ_TOKEN=$(curl -sk -X POST "$API/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$USTADZ_EMAIL\",\"password\":\"$USTADZ_PASS\"}" | j '.token')
echo "ustadz_token_len=${#USTADZ_TOKEN}" | tee -a "$OUT"

echo "=== 1. new application ===" | tee -a "$OUT"
APP=$(curl -sk -X POST "$API/v1/admissions/applications" -H 'Content-Type: application/json' -d "{\"admissionPeriodId\":\"f2999cf8-f746-49cd-a046-a0b50514b4c5\",\"applicantName\":\"E2E Santri\",\"email\":\"$SANTRI_EMAIL\",\"phone\":\"081298765432\"}")
APP_ID=$(echo "$APP" | j '.id'); APP_TOKEN=$(echo "$APP" | j '.applicantToken')
echo "app_id=$APP_ID status=$(echo "$APP" | j '.status')" | tee -a "$OUT"

echo "=== 2. admin review chain ===" | tee -a "$OUT"
for ST in ADMIN_VERIFIED SCREENING; do
  R=$(curl -sk -X PATCH "$API/v1/admissions/applications/$APP_ID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d "{\"status\":\"$ST\"}")
  echo "  -> $ST: $(echo "$R" | j '.kind // .status // .error // "?"')" | tee -a "$OUT"
done
curl -sk -X POST "$API/v1/admissions/applications/$APP_ID/reviews" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"status":"APPROVED","notes":"dokumen lengkap (E2E)"}' | j '"  review: " + (.status // .error // "?")' | tee -a "$OUT"
curl -sk -X POST "$API/v1/admissions/applications/$APP_ID/scores" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"category":"Akademik","score":92,"maxScore":100,"notes":"E2E"}' | j '"  score: " + (.id // .error // "?")' | tee -a "$OUT"
curl -sk -X POST "$API/v1/admissions/applications/$APP_ID/interviews" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d "{\"scheduledAt\":\"$(date -u -d '+1 day' +%Y-%m-%dT%H:%M:%SZ)\",\"location\":\"online\"}" | j '"  interview: " + (.id // .error // "?")' | tee -a "$OUT"
DEC=$(curl -sk -X POST "$API/v1/admissions/applications/$APP_ID/decision" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"decision":"ACCEPTED","reason":"E2E acceptance"}')
echo "  decision: $(echo "$DEC" | j '.decision // .error // "?"')" | tee -a "$OUT"

echo "=== 3. applicant registration ===" | tee -a "$OUT"
PROG=4d2266f8-8691-46ca-a14b-be5ff4eb0b11; COHORT=87c3c85b-e075-4da6-ba07-eda7a9fb3241
REG=$(curl -sk -X PUT "$API/v1/admissions/applications/$APP_ID/registration" -H "x-applicant-token: $APP_TOKEN" -H 'Content-Type: application/json' -d "{\"programId\":\"$PROG\",\"cohortId\":\"$COHORT\"}")
echo "  registration: $(echo "$REG" | j '.status // .error // "?"')" | tee -a "$OUT"

echo "=== 4. admin enroll ===" | tee -a "$OUT"
ENR=$(curl -sk -X PATCH "$API/v1/admissions/applications/$APP_ID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"status":"ENROLLED"}')
ENR_TOKEN=$(echo "$ENR" | j '.activationToken // empty')
echo "  enroll: $(echo "$ENR" | j '.kind // .status // .error // "?"') activation_len=${#ENR_TOKEN} student=$(echo "$ENR" | j '.studentNumber // .student_number // ""')" | tee -a "$OUT"

echo "=== 5. santri activation + login ===" | tee -a "$OUT"
curl -sk -X POST "$API/v1/auth/activate" -H 'Content-Type: application/json' -d "{\"token\":\"$ENR_TOKEN\",\"password\":\"$SANTRI_PASS\"}" >/dev/null
SANTRI_TOKEN=$(curl -sk -X POST "$API/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$SANTRI_EMAIL\",\"password\":\"$SANTRI_PASS\"}" | j '.token')
echo "  santri_token_len=${#SANTRI_TOKEN}" | tee -a "$OUT"

cat > /tmp/e2e-state.env <<EOF
APP_ID=$APP_ID
SANTRI_EMAIL=$SANTRI_EMAIL
SANTRI_PASS=$SANTRI_PASS
USTADZ_EMAIL=$USTADZ_EMAIL
USTADZ_PASS=$USTADZ_PASS
PROG=$PROG
COHORT=$COHORT
EOF
echo "E2E_PART1_OK" | tee -a "$OUT"
