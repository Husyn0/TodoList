
---

## File 2: `tests/test-emails.md`

```markdown
# Email verification + password reset (real Gmail)

Prerequisites:
- `.env` has a real Gmail App Password in `MAIL_PASSWORD` (16 chars, no spaces)
- `MAIL_FROM_ADDRESS` is set to your real Gmail (e.g. `debugdevtest0@gmail.com`)
- `php artisan config:clear` has been run
- Server is running on `:8000`
- You can open **https://mail.google.com** and log in as the test mailbox

Test mailbox (set once at the top of your shell):
- **Inbox used for real delivery:** `debugdevtest0@gmail.com`

Every id/token is captured into a shell variable. Do NOT copy ids manually.
Verification links are minted fresh via tinker for automation, but the **email itself is real** — click it in Gmail to confirm end-to-end.
```
---

## 0. Session setup

```bash
DEV_EMAIL="debugdevtest0@gmail.com"     # the real Gmail inbox
DEV_PASSWORD="password12345"

php artisan config:clear > /dev/null
echo "From: $(php artisan tinker --execute="echo config('mail.from.address');" | tail -n 1)"
```
Expected: your real Gmail address (not your_email@gmail.com).
```bash

php artisan route:list --path=api | grep -cE '^\s+(GET|POST|PUT|PATCH|DELETE)'
```
Expected: 23.
# 1. Register with the REAL Gmail — verification email must arrive
```bash

TAG=$(date +%s)
EMAIL="debugdevtest0+$TAG@gmail.com"   # Gmail plus-addressing → still lands in the same inbox
PASSWORD="$DEV_PASSWORD"

RESP=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"name\":\"Real $TAG\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"password_confirmation\":\"$PASSWORD\"}")

echo "$RESP" | jq '{id: .user.id, email: .user.email, verified: .email_verified}'

TOKEN=$(echo "$RESP" | jq -r .token)
USER_ID=$(echo "$RESP" | jq -r .user.id)

echo "TOKEN=$TOKEN"
echo "USER_ID=$USER_ID"

test "$USER_ID" != "null" && test -n "$USER_ID" && echo "OK" || echo "FAILED"
```
# 2. Fresh signed verification link (automation helper)

We mint a fresh signed URL via tinker so the automation is deterministic, while
the real email from Step 1 is what you'll click manually.
```bash

SIGNED_PATH=$(php artisan tinker --execute="
echo Illuminate\Support\Facades\URL::temporarySignedRoute(
    'verification.verify',
    now()->addMinutes(60),
    ['id' => $USER_ID, 'hash' => sha1('$EMAIL')]
);
" | tail -n 1)

SIGNED_REL=${SIGNED_PATH#http://localhost:8000}
SIGNED_REL=${SIGNED_REL#http://127.0.0.1:8000}

echo "SIGNED_REL=$SIGNED_REL"
test -n "$SIGNED_REL" && echo "OK" || echo "FAILED"
```
Expected: path like /api/email/verify/57/abc...?expires=...&signature=... and OK.

# 3. Hit the signed link → verified
```bash

LOCATION=$(curl -s -o /dev/null -w "%{redirect_url}" \
  "http://localhost:8000$SIGNED_REL" -H "Accept: application/json")

echo "LOCATION=$LOCATION"
echo "$LOCATION" | grep -q "status=success" && echo "OK" || echo "FAILED"
```
Expected: LOCATION=http://localhost:5173/verify-email?status=success, OK.

Confirm via status endpoint:
```bash

curl -s http://localhost:8000/api/email/verification-status \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```
Expected: verified: true, email_verified_at non-null.

# 4. Idempotency — hit the link again
```bash

LOCATION=$(curl -s -o /dev/null -w "%{redirect_url}" \
  "http://localhost:8000$SIGNED_REL" -H "Accept: application/json")

echo "LOCATION=$LOCATION"
echo "$LOCATION" | grep -q "already=1" && echo "OK" || echo "FAILED"
```
Expected: LOCATION=http://localhost:5173/verify-email?status=success&already=1, OK.
# 5. Tampered signature → redirect with status=error
```bash

BADSIG=$(echo "$SIGNED_REL" | sed 's/signature=./signature=0/')

HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://localhost:8000$BADSIG" -H "Accept: application/json")
LOCATION=$(curl -s -o /dev/null -w "%{redirect_url}" \
  "http://localhost:8000$BADSIG" -H "Accept: application/json")

echo "HTTP=$HTTP"
echo "LOCATION=$LOCATION"

test "$HTTP" = "302" && echo "$LOCATION" | grep -q "status=error" && echo "OK" || echo "FAILED"
```
Expected: HTTP=302, LOCATION=...?status=error&reason=sig, OK.

# 6. Resend — no-op for verified user
```bash

curl -s -X POST http://localhost:8000/api/email/verification-notification \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```
Expected: { "message": "Email already verified." }.

Register a second real Gmail user and resend:
```bash

TAG2=$(date +%s)
EMAIL2="debugdevtest0+r$TAG2@gmail.com"

TOKEN2=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"R $TAG2\",\"email\":\"$EMAIL2\",\"password\":\"$DEV_PASSWORD\",\"password_confirmation\":\"$DEV_PASSWORD\"}" \
  | jq -r .token)

curl -s -X POST http://localhost:8000/api/email/verification-notification \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN2" | jq
```
Expected: { "message": "Verification link sent." } and a second real email arrives.

# 7. Forgot password — real email arrives, response is neutral
```bash

curl -s -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\"}" | jq
```
Expected: { "message": "If that email is registered...", "status": "sent" }.
Real email with subject "Reset your password" should arrive in Gmail.

Unknown email — identical shape:
```bash

curl -s -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"nobody@nowhere.test"}' | jq
```
Expected: same shape, status: "sent". No user enumeration.

# 8. Generate a fresh reset token (dev helper)
```bash

R_EMAIL="$EMAIL"
RAW_RESET_TOKEN=$(R_EMAIL="$R_EMAIL" php artisan tinker --execute='
$u = App\Models\User::where("email", getenv("R_EMAIL"))->first();
if (!$u) { echo "USER_NOT_FOUND"; exit; }
$t = Illuminate\Support\Str::random(60);
Illuminate\Support\Facades\DB::table("password_reset_tokens")->updateOrInsert(
    ["email" => $u->email],
    ["token" => Illuminate\Support\Facades\Hash::make($t), "created_at" => now()]
);
echo $t;
' 2>/dev/null | tail -n 1)

echo "RAW_RESET_TOKEN=$RAW_RESET_TOKEN"
test -n "$RAW_RESET_TOKEN" && test "$RAW_RESET_TOKEN" != "USER_NOT_FOUND" && echo "OK" || echo "FAILED"
```
Expected: OK and a 60-char string.

# 9. Do the reset
```bash

NEWPASS="newpass4321"

curl -s -X POST http://localhost:8000/api/reset-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"token\":\"$RAW_RESET_TOKEN\",\"password\":\"$NEWPASS\",\"password_confirmation\":\"$NEWPASS\"}" | jq
```
Expected: { "message": "Your password has been reset." }.
```bash

echo "old password (should be 422):"
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$DEV_PASSWORD\"}"

echo "new password (should be 200):"
curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$NEWPASS\"}" | jq '{email_verified}'
```
Expected: 422 then { "email_verified": true }.

# 10. Old token is dead
```bash

curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: 401.
# 11. Reused reset token → invalid
```bash

curl -s -X POST http://localhost:8000/api/reset-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"token\":\"$RAW_RESET_TOKEN\",\"password\":\"whatever12\",\"password_confirmation\":\"whatever12\"}" \
  | jq '.errors // .message'
```
Expected: error containing "This password reset token is invalid."

12. Regression — period round-trips after reset

period is a dynamic deadline-shift string, not a time-of-day enum.
```bash

TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$NEWPASS\"}" | jq -r .token)

curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"regression","due_date":"2026-10-05","period":"+2 days"}' \
  | jq '{id,title,period}'

curl -s "http://localhost:8000/api/tasks?week_start=$(date -d 'last monday' +%Y-%m-%d)" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" \
  | jq --arg t "regression" '[.[] | select(.title==$t)] | length'
```
Expected: task JSON with period: "+2 days", then 1.