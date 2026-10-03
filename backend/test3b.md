# Test 3b — Re-run of the track steps with auto-captured IDs

## Step 0: Login
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password1234"}' \
  | grep -oP '"token":"\K[^"]+')
echo "TOKEN=$TOKEN"
```

## Step 1: Create a fresh recurring task and capture its id
```bash
TASK_ID=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "T3b recurring",
    "due_date": "2026-10-05",
    "repeat_preset": "custom",
    "repeat_days": ["monday","wednesday","friday"],
    "meeting_time": "09:30"
  }' | jq -r .id)

echo "TASK_ID=$TASK_ID"
test -n "$TASK_ID" && test "$TASK_ID" != "null" && echo "OK" || echo "FAILED to capture id"
```
### Expected: `TASK_ID=<number>` and `OK`.

## Step 2: Update the task (repeat fields)
```bash
curl -s -X PUT http://localhost:8000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"meeting_time":"10:15","repeat_days":["tuesday","thursday"]}' \
  | jq '{id, repeat_preset, repeat_days, meeting_time}'
```
### Expected: `id` = $TASK_ID, `repeat_days: ["tuesday","thursday"]`, `meeting_time: "10:15"`.

## Step 3: Upsert a track
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done","meeting_time":"09:45"}' | jq
```
### Expected: row with `task_id=$TASK_ID`, `date: "2026-10-07..."`, `status: "done"`, `meeting_time: "09:45:00"`.

## Step 4: Upsert again — should UPDATE not duplicate
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress"}' | jq
```
### Expected: same `id` as Step 3, `status: "in_progress"`, `meeting_time: "09:45:00"` preserved.

## Step 5: Second track on a different date
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-09 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done"}' | jq '{id, task_id, date, status}'
```

## Step 6: List tracks — should be 2
```bash
curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```
### Expected: `2`.

## Step 7: Range endpoint — this task should have 2 nested tracks
```bash
curl -s "http://localhost:8000/api/tasks/range?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq --arg id "$TASK_ID" '.[] | select(.id == ($id|tonumber)) | {id,title,tracks:(.tracks|length)}'
```
### Expected: `{ "id": ..., "title": "T3b recurring", "tracks": 2 }`.

## Step 8: Delete one track
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

## Step 9: Delete all tracks for the task
```bash
curl -i -X DELETE http://localhost:8000/api/tracks/task/$TASK_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
### Expected: 200.

## Step 10: Ownership — user B cannot touch user A's task
```bash
TOKEN2=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"Other3","email":"other3@example.com","password":"password123","password_confirmation":"password123"}' \
  | jq -r .token)

curl -i -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"status":"done"}'
```
### Expected: 403 Forbidden. (If user already exists, drop the register and login as other3.)

## Step 11: Cascade — add a track, delete the task, tracks gone
```bash
curl -s -X PUT http://localhost:8000/api/tracks/$TASK_ID/2026-10-07 \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"pending"}' > /dev/null

echo "tracks before delete: $(curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | jq '[.[] | select(.task_id=='"$TASK_ID"')] | length')"

curl -i -X DELETE http://localhost:8000/api/tasks/$TASK_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"

echo "tracks after delete:  $(curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" | jq '[.[] | select(.task_id=='"$TASK_ID"')] | length')"
```
### Expected: `before: 1`, delete 200, `after: 0`.

## Step 12: Cleanup — remove the old manual track from task 36
```bash
curl -s "http://localhost:8000/api/tracks?from=2026-10-01&to=2026-10-31" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```
### Expected: empty array `[]` (task 36's manual track was created via tinker, not via API — we can leave it or delete via tinker if you want clean state).