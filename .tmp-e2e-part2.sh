#!/bin/bash
# G7 E2E part 2 — academic, reward, AI+ledger, Build Agent, portfolio, health
set -uo pipefail
source /tmp/e2e-state.env
API="https://ai.pondokmultimedia.id"
WEB="https://pondokmultimedia.id"
ADMIN_EMAIL="admin@pmmi.local"; ADMIN_PASS="masajidallah13"
OUT=/tmp/e2e-part2.out
: > "$OUT"
j() { jq -r "$1" 2>/dev/null; }
AUTH() { echo "Authorization: Bearer $1"; }
post() { curl -sk -X POST "$1" -H "$(AUTH "$2")" -H 'Content-Type: application/json' -d "$3"; }

ADMIN_TOKEN=$(curl -sk -X POST "$API/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" | j '.token')
USTADZ_TOKEN=$(curl -sk -X POST "$API/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$USTADZ_EMAIL\",\"password\":\"$USTADZ_PASS\"}" | j '.token')
SANTRI_TOKEN=$(curl -sk -X POST "$API/v1/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$SANTRI_EMAIL\",\"password\":\"$SANTRI_PASS\"}" | j '.token')
echo "santri_id=$SANTRI_ID ustadz_id=$USTADZ_ID" | tee -a "$OUT"

echo "=== 6. academic ===" | tee -a "$OUT"
COURSE=$(post "$API/v1/academic/courses" "$ADMIN_TOKEN" '{"code":"WEB102","name":"Web Dev E2E 2","description":"E2E"}')
COURSE_ID=$(echo "$COURSE" | j '.id'); echo "  course=$COURSE_ID" | tee -a "$OUT"
CLASS=$(post "$API/v1/academic/classes" "$ADMIN_TOKEN" "{\"courseId\":\"$COURSE_ID\",\"name\":\"Kelas E2E 2\",\"teacherUserId\":\"$USTADZ_ID\"}")
CLASS_ID=$(echo "$CLASS" | j '.id'); echo "  class=$CLASS_ID" | tee -a "$OUT"
ENR=$(post "$API/v1/academic/classes/$CLASS_ID/enroll" "$ADMIN_TOKEN" "{\"studentUserId\":\"$SANTRI_ID\"}")
echo "  enroll-santri: $(echo "$ENR" | j '.id // .error // "?"')" | tee -a "$OUT"
ASSIGN=$(post "$API/v1/academic/assignments" "$USTADZ_TOKEN" "{\"classId\":\"$CLASS_ID\",\"title\":\"Tugas E2E 2\",\"description\":\"Landing page\",\"maxScore\":100}")
ASSIGN_ID=$(echo "$ASSIGN" | j '.id'); echo "  assignment=$ASSIGN_ID" | tee -a "$OUT"

echo "=== 7. upload + submit ===" | tee -a "$OUT"
UPLOAD=$(post "$API/v1/academic/assignments/$ASSIGN_ID/uploads" "$SANTRI_TOKEN" '{"originalName":"index.html","contentType":"text/html"}')
UPLOAD_ID=$(echo "$UPLOAD" | j '.uploadId'); PURL=$(echo "$UPLOAD" | j '.url')
echo "  upload_intent=$UPLOAD_ID" | tee -a "$OUT"
echo '<html><body><h1>E2E Submission 2</h1></body></html>' > /tmp/e2e-file.html
HTTP=$(curl -sk -o /dev/null -w '%{http_code}' -X PUT "$PURL" -H 'Content-Type: text/html' --data-binary @/tmp/e2e-file.html)
echo "  presigned_put_http=$HTTP" | tee -a "$OUT"
SUB=$(post "$API/v1/academic/assignments/$ASSIGN_ID/submissions" "$SANTRI_TOKEN" "{\"uploadIds\":[\"$UPLOAD_ID\"],\"notes\":\"tugas E2E 2\"}")
SUB_ID=$(echo "$SUB" | j '.id'); echo "  submission=$SUB_ID status=$(echo "$SUB" | j '.status // ""')" | tee -a "$OUT"

echo "=== 8. grade ===" | tee -a "$OUT"
GRADE=$(post "$API/v1/academic/submissions/$SUB_ID/grade" "$USTADZ_TOKEN" '{"score":95,"feedback":"Bagus!","revisionRequired":false}')
echo "  grade: $(echo "$GRADE" | j '.ok // .id // .error // "?"')" | tee -a "$OUT"

echo "=== 9. reward grant ===" | tee -a "$OUT"
GRANT=$(post "$API/v1/rewards/grant" "$ADMIN_TOKEN" "{\"userId\":\"$SANTRI_ID\",\"rewardRuleId\":\"7ae711be-294e-4e7b-95d1-9d68303c6eee\"}")
echo "  grant: $(echo "$GRANT" | j '.id // .error // "?"')" | tee -a "$OUT"

echo "=== 10. AI request + ledger ===" | tee -a "$OUT"
AI=$(post "$API/v1/chat/completions" "$SANTRI_TOKEN" '{"model":"ds/deepseek-v4-pro","messages":[{"role":"user","content":"Reply with exactly: E2E-OK2"}],"max_tokens":10}')
echo "  ai_content: $(echo "$AI" | j '.choices[0].message.content // .error // "?"')" | tee -a "$OUT"
echo "  ai_request_id: $(echo "$AI" | j '.id // ""')" | tee -a "$OUT"

echo "=== 11. Build Agent ===" | tee -a "$OUT"
for OLD in $(curl -sk "$API/v1/hermes/agents" -H "$(AUTH "$SANTRI_TOKEN")" | j '.items[]? | select(.status=="FAILED" or .status=="PENDING") | .id' 2>/dev/null); do
  post "$API/v1/hermes/agents/$OLD/archive" "$SANTRI_TOKEN" '{}' >/dev/null 2>&1
  echo "  archived: $OLD" | tee -a "$OUT"
done
sleep 12
AGENT=$(post "$API/v1/hermes/agents" "$SANTRI_TOKEN" '{"displayName":"Agent E2E 2"}')
PROFILE_ID=$(echo "$AGENT" | j '.id')
echo "  build: $(echo "$AGENT" | j '.status // .error // "?"') profile=$PROFILE_ID" | tee -a "$OUT"
sleep 40
curl -sk "$API/v1/hermes/agents" -H "$(AUTH "$SANTRI_TOKEN")" | j '.items[0] | "  agent_status=" + .status' | tee -a "$OUT"

echo "=== 12. feature + public portfolio ===" | tee -a "$OUT"
FEAT=$(post "$API/v1/academic/submissions/$SUB_ID/feature" "$USTADZ_TOKEN" '{"title":"Karya E2E 2","description":"Portfolio E2E 2","slug":"e2e-karya-2"}')
echo "  feature: $(echo "$FEAT" | j '.ok // .id // .error // "?"')" | tee -a "$OUT"
sleep 2
echo "  public /portfolio contains slug: $(curl -sk "$WEB/portfolio" | grep -c 'e2e-karya-2' 2>/dev/null || true)" | tee -a "$OUT"

echo "=== 13. admin health ===" | tee -a "$OUT"
curl -sk "$API/v1/ops/health" -H "$(AUTH "$ADMIN_TOKEN")" | j -c '{postgres,minio,nineRouter,outboxPending}' | tee -a "$OUT"

echo "E2E_PART2_OK" | tee -a "$OUT"
