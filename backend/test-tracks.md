# Tracks & Recurring Tasks Test

Covers: recurring task fields on `tasks`, per-date `task_tracks` upsert/list/delete, cascade.
Requires: server running. Run `test-main.md` first if you suspect general breakage.

---

## 0. Setup — fresh user + token

```bash
EMAIL="tracks+$(date +%s)@example.com"
PASSWORD="password123"

TOKEN=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"Track Tester\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"password_confirmation\":\"$PASSWORD\"}" \
  | jq -r .token)

echo "TOKEN=$TOKEN"
test -n "$TOKEN" && test "$TOKEN" != "null" && echo "OK" || echo "FAILED"
```
**Expected:** `OK`.

---

## 1. Create a recurring task (custom Mon/Wed/Fri, 09:30)

```bash
TASK_ID=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Standup",
    "due_date":"2026-10-05",
    "priority":"high",
    "repeat_preset":"custom",
    "repeat_days":["monday","wednesday","friday"],
    "meeting_time":"09:30"
  }' | jq -r .id)

echo "TASK_ID=$TASK_ID"
test -n "$TASK_ID" && test "$TASK_ID" != "null" && echo "OK" || echo "FAILED"
```
**Expected:** `OK`. Verify shape:
```bash
curl -s "http://localhost:8000/api/tasks/range?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '.[] | select(.id==($id|tonumber)) | {repeat_preset, repeat_days, meeting_time}'
```
**Expected:** `repeat_preset: "custom"`, `repeat_days: ["monday","wednesday","friday"]`, `meeting_time: "09:30:00"`.

---

## 2. Validation — bad repeat_days and bad meeting_time

```bash
echo "bad days:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"x","due_date":"2026-10-05","repeat_preset":"custom","repeat_days":["MONDAY","funday"]}'

echo "bad time:"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"x","due_date":"2026-10-05","meeting_time":"25:99"}'
```
**Expected:** `422`, `422`.

---

## 3. Upsert a track — should CREATE

```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done","meeting_time":"09:45"}' \
  | jq '{id, task_id, date, status, meeting_time}'
```
**Expected:** `task_id: $TASK_ID`, `status: "done"`, `meeting_time: "09:45:00"`. Note the `id` — it's the same one you should see in Step 4.

---

## 4. Upsert same (task,date) — should UPDATE not duplicate

```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress"}' | jq
```
**Expected:** same `id` as Step 3, `status: "in_progress"`, `meeting_time: "09:45:00"` preserved.

---

## 5. Add a second track on a different date

```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-09 \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done"}' | jq '{id, task_id, date, status}'
```

Verify count for this task only:
```bash
curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '[.[] | select(.task_id==($id|tonumber))] | length'
```
**Expected:** `2`.

---

## 6. Range endpoint — tracks nested under the task

```bash
curl -s "http://localhost:8000/api/tasks/range?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '.[] | select(.id==($id|tonumber)) | {id, title, tracks:(.tracks|length)}'
```
**Expected:** `tracks: 2`.

---

## 7. Delete one track

```bash
curl -s -X DELETE http://localhost:8000/api/tracks/$TASK_ID/2026-10-09 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .message

curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '[.[] | select(.task_id==($id|tonumber))] | length'
```
**Expected:** `"Deleted"`, then `1`.

---

## 8. Delete all tracks for the task

```bash
curl -s -X DELETE http://localhost:8000/api/tracks/task/$TASK_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .message

curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '[.[] | select(.task_id==($id|tonumber))] | length'
```
**Expected:** `"Deleted"`, then `0`.

---

## 9. Ownership — user B cannot touch user A's track

```bash
EMAIL2="other+$(date +%s)@example.com"
TOKEN2=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"Other\",\"email\":\"$EMAIL2\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}" \
  | jq -r .token)

curl -s -o /dev/null -w "%{http_code}\n" -X PUT \
  http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"status":"done"}'
```
**Expected:** `403`.

---

## 10. Cascade — delete task, tracks vanish

```bash
# re-add a track
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"pending"}' > /dev/null

echo "before: $(curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '[.[] | select(.task_id==($id|tonumber))] | length')"

curl -s -X DELETE http://localhost:8000/api/tasks/$TASK_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq .message

echo "after:  $(curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '[.[] | select(.task_id==($id|tonumber))] | length')"
```
**Expected:** `before: 1`, `"Deleted"`, `after: 0`.

---

## 11. Regression — weekly task list still works

```bash
MONDAY=$(date -d 'last monday' +%Y-%m-%d)
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://localhost:8000/api/tasks?week_start=$MONDAY" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
**Expected:** `200`.