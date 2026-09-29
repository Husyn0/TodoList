# Step 0: Sanity Check (Is the API Alive?)
```bash

curl -i http://localhost:8000/api/me
```

## Quick check of routes:
```bash

php artisan route:list --path=api
```
# Step 1: Register a New Account
```bash

curl -i -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```
# Expected: 201 Created with:
```json

{
  "user": { "id": 1, "name": "Test User", "email": "test@example.com", ... },
  "token": "1|abcdef123..."
}
```

# Step 2: Save Token as a Shell Variable (Easier Testing)

### Instead of copy-pasting, extract the token automatically:
```bash

TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -oP '"token":"\K[^"]+')

echo "TOKEN=$TOKEN"
```
# Step 3: Verify Auth Works (/me)
```bash

curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
# Step 4: Create a Task
```bash

curl -i -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Write project spec",
    "description": "Draft the initial requirements doc",
    "due_date": "2026-10-01",
    "priority": "high",
    "status": "pending",
    "position": 0
  }'
```
### Create a second task for testing lists:
```bash

curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Review PRs",
    "due_date": "'$(date -d "last monday +1 day" +%Y-%m-%d)'",
    "priority": "medium"
  }' | jq
  ```

# Step 5: List Tasks for the Week
```bash

MONDAY=$(date -d "last monday" +%Y-%m-%d)

curl -i "http://localhost:8000/api/tasks?week_start=$MONDAY" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

# Step 7: Update a Task
```bash

curl -i -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Write project spec (updated)",
    "status": "in_progress",
    "priority": "medium"
  }'
```

# Step 8: Move a Task (Drag & Drop Endpoint)
```bash

curl -i -X PATCH http://localhost:8000/api/tasks/1/move \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "due_date": "'$(date -d "last monday +3 days" +%Y-%m-%d)'",
    "position": 5
  }'
  ```

# Step 9: Settings — Read
```bash

curl -i http://localhost:8000/api/settings \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```

# Step 10: Settings — Update Profile
```bash

curl -i -X PUT http://localhost:8000/api/settings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test User Renamed",
    "theme": "dark",
    "week_start": "sunday",
    "timezone": "Asia/Beirut"
  }' | jq
```

# Step 11: Settings — Change Password
```bash

curl -i -X PUT http://localhost:8000/api/settings/password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "current_password": "password123",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
  }' | jq
```
### Verify the new password works:
bash

curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"newpassword123"}' | jq '.token'

###  💡 Change it back if you want to keep using password123:
```bash
curl -X PUT http://localhost:8000/api/settings/password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"current_password":"newpassword123","password":"password123","password_confirmation":"password123"}'
```
# Step 12: Delete a Task
```bash

curl -i -X DELETE http://localhost:8000/api/tasks/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
### Verify it's gone:
```bash

MONDAY=$(date -d "last monday" +%Y-%m-%d)
curl -s "http://localhost:8000/api/tasks?week_start=$MONDAY" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
```

# Step 13: Logout
```bash

curl -i -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
### Confirm the token is dead:
```bash

curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
# Step 14: Test Error Cases (Validation)

### These confirm your API returns proper 422s so the frontend can display them.

### Missing email:
```bash

curl -i -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"X","password":"password123","password_confirmation":"password123"}'
  ```
### Weak password:
```bash

curl -i -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Y","email":"y@y.com","password":"123","password_confirmation":"123"}'
  ```
### Wrong login credentials:
```bash

curl -i -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"wrongpass"}'
```
### Unauthorized task creation:
```bash

curl -i -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"title":"Nope","due_date":"2026-10-01"}'
```
### Task ownership (403):
### Register a second user, try to edit user 1's task:
```bash

TOKEN2=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"name":"Other","email":"other@example.com","password":"password123","password_confirmation":"password123"}' \
  | jq -r .token)

curl -i -X DELETE http://localhost:8000/api/tasks/2 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN2"
  ```