# Main API Test — full smoke

Requires: server on `http://localhost:8000`.
Every id is captured into a shell variable. Do NOT hardcode ids.

---

## 0. Sanity

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/me
```
Expected: `401`.

```bash
php artisan route:list --path=api | grep -cE '^\s+(GET|POST|PUT|PATCH|DELETE)'
```
Expected: `23`.

```bash
php artisan tinker --execute="
echo 'users.week_end: '.(Schema::hasColumn('users','week_end') ? 'yes' : 'no').PHP_EOL;
echo 'tasks.period:   '.(Schema::hasColumn('tasks','period')   ? 'yes' : 'no').PHP_EOL;
"
```
Expected: `yes` then `yes`.

---

## 1. Register + login

```bash
EMAIL="test+$(date +%s)@example.com"
PASSWORD="password123"

RESP=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"password_confirmation\":\"$PASSWORD\"}")

echo "$RESP" | jq '{email: .user.email, token_prefix: (.token | .[0:20])}'
```
Expected: new email + 20-char token preview.

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r .token)

echo "TOKEN=$TOKEN"
test -n "$TOKEN" && test "$TOKEN" != "null" && echo "OK" || echo "FAILED"
```
Expected: `OK`.

---

## 2. /me with and without token

```bash
echo "with token:"
curl -s http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq '{email: .user.email, verified: .email_verified}'

echo "without token:"
curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:8000/api/me -H "Accept: application/json"
```
Expected: your email then `401`.

---

## 3. Create two tasks with period

```bash
TASK_A=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Task A","description":"first",
    "due_date":"'"$(date -d 'last monday' +%Y-%m-%d)"'",
    "priority":"high","status":"pending","position":0,
    "period":"morning"
  }' | jq -r .id)

TASK_B=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Task B","description":"second",
    "due_date":"'"$(date -d 'last monday +2 days' +%Y-%m-%d)"'",
    "priority":"medium",
    "period":"evening"
  }' | jq -r .id)

echo "TASK_A=$TASK_A  TASK_B=$TASK_B"
test -n "$TASK_A" && test "$TASK_A" != "null" && \
test -n "$TASK_B" && test "$TASK_B" != "null" && echo "OK" || echo "FAILED"
```
Expected: `OK`.

Verify period round-tripped:
```bash
curl -s "http://localhost:8000/api/tasks?week_start=$(date -d 'last monday' +%Y-%m-%d)" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg a "$TASK_A" --arg b "$TASK_B" \
      'map(select(.id==($a|tonumber) or .id==($b|tonumber))) | map({title, period})'
```
Expected: both tasks with their period.

---

## 4. List this week's tasks

```bash
MONDAY=$(date -d 'last monday' +%Y-%m-%d)
curl -s "http://localhost:8000/api/tasks?week_start=$MONDAY" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg a "$TASK_A" --arg b "$TASK_B" \
      'map(select(.id==($a|tonumber) or .id==($b|tonumber))) | map(.title)'
```
Expected: `["Task A", "Task B"]`.

---

## 5. Update Task A — including period

```bash
curl -s -X PUT http://localhost:8000/api/tasks/$TASK_A \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Task A (updated)","status":"in_progress","priority":"medium","period":"afternoon"}' \
  | jq '{id, title, status, priority, period}'
```
Expected: title updated, status `in_progress`, period `afternoon`.

---

## 6. Move Task A

```bash
curl -s -X PATCH http://localhost:8000/api/tasks/$TASK_A/move \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"due_date":"'"$(date -d 'last monday +4 days' +%Y-%m-%d)"'","position":5}' \
  | jq '{id, due_date, position}'
```
Expected: position `5`.

---

## 7. Settings — read, update (with week_end), password change

```bash
echo "read:"
curl -s http://localhost:8000/api/settings \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{name, theme, timezone, week_start, week_end}'

echo "update:"
curl -s -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Renamed","theme":"dark","timezone":"Asia/Beirut","week_start":"monday","week_end":"friday"}' \
  | jq '{message, name: .user.name, theme: .user.theme, week_start: .user.week_start, week_end: .user.week_end}'
```
Expected: read shows defaults (`week_end: sunday`), update shows `week_end: friday`.

Password change:
```bash
NEW_PASSWORD="newpass1234"

curl -s -X PUT http://localhost:8000/api/settings/password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"current_password\":\"$PASSWORD\",\"password\":\"$NEW_PASSWORD\",\"password_confirmation\":\"$NEW_PASSWORD\"}" \
  | jq .message

curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$NEW_PASSWORD\"}" \
  | jq -r 'if .token then "LOGIN_OK" else "LOGIN_FAILED" end'
```
Expected: `"Password updated"` then `LOGIN_OK`.

---

## 8. Delete Task B

```bash
curl -s -X DELETE http://localhost:8000/api/tasks/$TASK_B \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .message

curl -s "http://localhost:8000/api/tasks?week_start=$(date -d 'last monday' +%Y-%m-%d)" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg b "$TASK_B" '[.[] | select(.id==($b|tonumber))] | length'
```
Expected: `"Deleted"` then `0`.

---

## 9. Ownership

```bash
EMAIL2="other+$(date +%s)@example.com"
TOKEN2=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"Other\",\"email\":\"$EMAIL2\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}" \
  | jq -r .token)

curl -s -o /dev/null -w "%{http_code}\n" -X DELETE \
  http://localhost:8000/api/tasks/$TASK_A \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN2"
```
Expected: `403`.

---

## 10. Validation errors

```bash
echo "missing email:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"X","password":"password123","password_confirmation":"password123"}'

echo "weak password:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"Y","email":"yy'"$(date +%s)"'@y.com","password":"123","password_confirmation":"123"}'

echo "wrong login:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrongpass\"}"

echo "unauth task create:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"title":"Nope","due_date":"2026-10-05"}'

echo "bad period:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"x","due_date":"2026-10-05","period":"dawn"}'

echo "bad week_end:"
curl -s -o /dev/null -w "%{http_code}\n" -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"week_end":"funday"}'
```
Expected: `422`, `422`, `422`, `401`, `422`, `422`.

---

## 11. Logout

```bash
curl -s -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .message

curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: `"Logged out"` then `401`.

---

## 12. Email verification + password reset smoke

```bash
TAG=$(date +%s)
EMAIL="m+$TAG@example.com"

RESP=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"M\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}")
TOKEN=$(echo "$RESP" | jq -r .token)
echo "$RESP" | jq '{id: .user.id, verified: .email_verified}'

curl -s http://localhost:8000/api/email/verification-status \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq

curl -s -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\"}" | jq .status
```
Expected: `verified: false`, status shows `verified: false`, forgot-password returns `"sent"`.

For the full flow, run `test-emails.md`.