#!/usr/bin/env bash
set -e

BASE="http://localhost:8000/api"
EMAIL="test_$(date +%s)@example.com"
PASS="password123"

echo "═══════════════════════════════════════"
echo "  API Test Suite — $BASE"
echo "═══════════════════════════════════════"

hr() { echo; echo "── $1 ──"; }

hr "0. Sanity — /me without token (expect 401)"
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE/me"

hr "1. Register"
REG=$(curl -s -X POST "$BASE/register" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"password_confirmation\":\"$PASS\"}")
echo "$REG" | jq '.user.email, .token[0:20] + "..."'
TOKEN=$(echo "$REG" | jq -r .token)

hr "2. /me with token"
curl -s "$BASE/me" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | jq '.name, .email'

hr "3. Create task (in current week)"
MONDAY=$(date -d "last monday" +%Y-%m-%d)
TASK=$(curl -s -X POST "$BASE/tasks" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\":\"Test task\",\"description\":\"hi\",\"due_date\":\"$MONDAY\",\"priority\":\"high\"}")
echo "$TASK" | jq '.id, .title, .due_date'
TASK_ID=$(echo "$TASK" | jq -r .id)

hr "4. List tasks for week"
curl -s "$BASE/tasks?week_start=$MONDAY" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

hr "5. Update task"
curl -s -X PUT "$BASE/tasks/$TASK_ID" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Updated title","status":"in_progress"}' | jq '.title, .status'

hr "6. Move task"
NEWDATE=$(date -d "last monday +2 days" +%Y-%m-%d)
curl -s -X PATCH "$BASE/tasks/$TASK_ID/move" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"due_date\":\"$NEWDATE\",\"position\":1}" | jq '.due_date'

hr "7. Settings read"
curl -s "$BASE/settings" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq

hr "8. Settings update"
curl -s -X PUT "$BASE/settings" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"theme":"dark","week_start":"sunday"}' | jq '.user.theme, .user.week_start'

hr "9. Settings password change"
curl -s -X PUT "$BASE/settings/password" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"current_password\":\"$PASS\",\"password\":\"newpass123\",\"password_confirmation\":\"newpass123\"}" | jq

hr "10. Login with new password"
curl -s -X POST "$BASE/login" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"newpass123\"}" | jq '.user.email'

hr "11. Delete task"
curl -s -X DELETE "$BASE/tasks/$TASK_ID" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | jq

hr "12. Logout"
curl -s -X POST "$BASE/logout" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | jq

hr "13. Use token after logout (expect 401)"
curl -s -o /dev/null -w "HTTP %{http_code}\n" "$BASE/me" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN"

echo
echo "✅ All tests completed"