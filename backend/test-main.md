# Main API Test — Run after any backend change

Full end-to-end smoke test. **Every task id is captured automatically.**
Requires: server running at `http://localhost:8000`.

---

## 0. Sanity

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/me
```
**Expected:** `401` (unauth, but server is up).

```bash
php artisan route:list --path=api
```
**Expected:** 18 routes (auth, settings, tasks, tracks).

---

## 1. Register — create a fresh isolated user for this run

Using a timestamped email so every run starts clean.

```bash
EMAIL="test+$(date +%s)@example.com"
PASSWORD="password123"

RESP=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"password_confirmation\":\"$PASSWORD\"}")

echo "$RESP" | jq '{email: .user.email, token_prefix: (.token | .[0:20])}'
```
**Expected:** JSON with the new email and a 20-char token preview.

Grab the token separately:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r .token)

echo "TOKEN=$TOKEN"
test -n "$TOKEN" && test "$TOKEN" != "null" && echo "OK" || echo "FAILED"
```
**Expected:** `OK`.

---

## 2. Auth — /me works with token, fails without

```bash
echo "with token:"; curl -s http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq '.email'

echo "without token:"; curl -s -o /dev/null -w "%{http_code}\n" \
  http://localhost:8000/api/me -H "Accept: application/json"
```
**Expected:** your email, then `401`.

---

## 3. Create two tasks and capture their ids

```bash
TASK_A=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Task A","description":"first",
    "due_date":"'"$(date -d 'last monday' +%Y-%m-%d)"'",
    "priority":"high","status":"pending","position":0
  }' | jq -r .id)

TASK_B=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Task B","description":"second",
    "due_date":"'"$(date -d 'last monday +2 days' +%Y-%m-%d)"'",
    "priority":"medium"
  }' | jq -r .id)

echo "TASK_A=$TASK_A  TASK_B=$TASK_B"
test -n "$TASK_A" && test "$TASK_A" != "null" && \
test -n "$TASK_B" && test "$TASK_B" != "null" && echo "OK" || echo "FAILED"
```
**Expected:** `OK`.

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
**Expected:** `["Task A", "Task B"]` (order may vary).

---

## 5. Update Task A

```bash
curl -s -X PUT http://localhost:8000/api/tasks/$TASK_A \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Task A (updated)","status":"in_progress","priority":"medium"}' \
  | jq '{id, title, status, priority}'
```
**Expected:** `title: "Task A (updated)"`, `status: "in_progress"`.

---

## 6. Move Task A (drag & drop)

```bash
curl -s -X PATCH http://localhost:8000/api/tasks/$TASK_A/move \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"due_date":"'"$(date -d 'last monday +4 days' +%Y-%m-%d)"'","position":5}' \
  | jq '{id, due_date, position}'
```
**Expected:** `position: 5`, `due_date` = Thursday of last week.

---

## 7. Settings — read, update, password change

```bash
echo "read:"; curl -s http://localhost:8000/api/settings \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{name, theme, timezone, week_start}'

echo "update:"; curl -s -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Renamed","theme":"dark","timezone":"Asia/Beirut","week_start":"sunday"}' \
  | jq '{message, user: .user.name, theme: .user.theme}'
```
**Expected:** read shows current values, update returns `message: "Updated"` and the new name/theme.

Password change:
```bash
NEW_PASSWORD="newpass1234"

curl -s -X PUT http://localhost:8000/api/settings/password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"current_password\":\"$PASSWORD\",\"password\":\"$NEW_PASSWORD\",\"password_confirmation\":\"$NEW_PASSWORD\"}" \
  | jq .message

# Verify new password works
curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$NEW_PASSWORD\"}" \
  | jq -r 'if .token then "LOGIN_OK" else "LOGIN_FAILED" end'
```
**Expected:** `"Password updated"` then `LOGIN_OK`.

---

## 8. Delete Task B, confirm it's gone

```bash
curl -s -X DELETE http://localhost:8000/api/tasks/$TASK_B \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .message

curl -s "http://localhost:8000/api/tasks?week_start=$(date -d 'last monday' +%Y-%m-%d)" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg b "$TASK_B" '[.[] | select(.id==($b|tonumber))] | length'
```
**Expected:** `"Deleted"`, then `0`.

---

## 9. Ownership — user B cannot touch user A's task

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
**Expected:** `403`.

---

## 10. Validation errors (sample of each)

```bash
echo "register missing email:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"X","password":"password123","password_confirmation":"password123"}'

echo "register weak password:"
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
  -d '{"title":"Nope","due_date":"2026-10-01"}'
```
**Expected:** `422`, `422`, `422`, `401`.

---

## 11. Logout — token dies

```bash
curl -s -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .message

curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
**Expected:** `"Logged out"`, then `401`.

---

## Notes

- Every run creates a new throwaway user via `test+<timestamp>@example.com`, so no state leaks.
- Task ids are captured into shell variables (`$TASK_A`, `$TASK_B`) — never hardcode ids.
- All `jq` calls use `-s` (silent), not `-i` (which mixes headers into stdout).
- If a step fails, the `test -n …` guards on steps 1 and 3 will print `FAILED` before you waste time on downstream errors.