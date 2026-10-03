# Test 3 — Tasks (repeat + meeting_time) and Tracks API

## Step 0: Confirm new routes exist
```bash
php artisan route:list --path=api
```
### Expected new rows:
```
GET|HEAD  api/tasks/range ................ tasks.range › Api\TaskController@range
GET|HEAD  api/tracks ..................... tracks.index › Api\TrackController@index
PUT       api/tracks/{task}/{date} ....... tracks.upsert › Api\TrackController@upsert
DELETE    api/tracks/task/{task} ......... tracks.destroyForTask › Api\TrackController@destroyForTask
DELETE    api/tracks/{task}/{date} ....... tracks.destroy › Api\TrackController@destroy
```

---

## Step 1: Login and grab token
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password1234"}' \
  | grep -oP '"token":"\K[^"]+')
echo "TOKEN=$TOKEN"
```

---

## Step 2: Create a recurring task (custom Mon/Wed/Fri, with meeting_time)
```bash
curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Recurring standup",
    "description": "Team sync",
    "due_date": "2026-10-05",
    "priority": "high",
    "status": "pending",
    "position": 0,
    "repeat_preset": "custom",
    "repeat_days": ["monday","wednesday","friday"],
    "meeting_time": "09:30"
  }' | jq
```
### Expected:
- 201, task JSON.
- `repeat_preset: "custom"`, `repeat_days: ["monday","wednesday","friday"]` (array), `meeting_time: "09:30:00"`.

Note the `id` — export it:
```bash
TASK_ID=<paste id>
```

---

## Step 3: Validation — reject bad repeat_days
```bash
curl -i -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Bad repeat",
    "due_date": "2026-10-05",
    "repeat_preset": "custom",
    "repeat_days": ["MONDAY", "funday"]
  }'
```
### Expected: 422 with errors on `repeat_days.0` and `repeat_days.1`.

---

## Step 4: Validation — reject bad meeting_time
```bash
curl -i -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Bad time",
    "due_date": "2026-10-05",
    "meeting_time": "25:99"
  }'
```
### Expected: 422, `meeting_time` invalid.

---

## Step 5: Update an existing task — add repeat fields
```bash
curl -s -X PUT http://localhost:8000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "meeting_time": "10:15",
    "repeat_days": ["tuesday","thursday"]
  }' | jq '{id, repeat_preset, repeat_days, meeting_time}'
```
### Expected: `repeat_days: ["tuesday","thursday"]`, `meeting_time: "10:15:00"`.

---

## Step 6: Range endpoint
```bash
curl -s "http://localhost:8000/api/tasks/range?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq 'map({id,title,due_date,tracks:(.tracks|length)})'
```
### Expected: array of tasks in October with `tracks: 0` (none yet).

---

## Step 7: Upsert a track for the recurring task on a specific day
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done","meeting_time":"09:45"}' | jq
```
### Expected: track row with `task_id`, `date: "2026-10-07"`, `status: "done"`, `meeting_time: "09:45:00"`.

---

## Step 8: Upsert again on same (task,date) — should UPDATE, not duplicate
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress"}' | jq
```
### Expected: same `id`, `status: "in_progress"`, `meeting_time: "09:45:00"` preserved.

---

## Step 9: Add a second track (different date)
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-09 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done"}' | jq
```

---

## Step 10: List tracks in range
```bash
curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```
### Expected: 2 tracks.

---

## Step 11: Range endpoint again — tracks should now be nested
```bash
curl -s "http://localhost:8000/api/tasks/range?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq ".[] | select(.id==$TASK_ID) | {id,title,tracks}"
```
### Expected: `.tracks` contains 2 rows.

---

## Step 12: Delete one track
```bash
curl -i -X DELETE http://localhost:8000/api/tracks/$TASK_ID/2026-10-09 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
### Expected: 200, `{"message":"Deleted"}`.

Verify:
```bash
curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```
### Expected: `1`.

---

## Step 13: Delete all tracks for the task
```bash
curl -i -X DELETE http://localhost:8000/api/tracks/task/$TASK_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
### Expected: 200.

---

## Step 14: Authorization — user B cannot touch user A's track
```bash
TOKEN2=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"Other2","email":"other2@example.com","password":"password123","password_confirmation":"password123"}' \
  | jq -r .token)

curl -i -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"status":"done"}'
```
### Expected: 403 Forbidden.

---

## Step 15: Delete the recurring task — tracks cascade
First re-add a track so there's something to cascade:
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done"}' > /dev/null

curl -i -X DELETE http://localhost:8000/api/tasks/$TASK_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"

curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```
### Expected: delete 200, then tracks length `0`.

---

## Step 16: Regression — old `GET /tasks?week_start=…` still works
```bash
MONDAY=$(date -d 'last monday' +%Y-%m-%d)
curl -s "http://localhost:8000/api/tasks?week_start=$MONDAY" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```
### Expected: number (unchanged behaviour).