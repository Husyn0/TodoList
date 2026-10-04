# Email Tests — Batch 2/3: Verification + Password Reset (FINAL)

Prerequisites:
- `.env` has real Gmail App Password in `MAIL_PASSWORD` (16 chars, no spaces)
- `php artisan config:clear` has been run
- Server is running on :8000
- SMTP single-email test has been confirmed working

Every id/token is captured into a shell variable. **Do not copy ids manually.**

---

## 0. Session setup

```bash
DEV_EMAIL="debugdevtest0@gmail.com"
DEV_PASSWORD="password123"

php artisan config:clear > /dev/null
echo "From: $(php artisan tinker --execute="echo config('mail.from.address');" | tail -n 1)"
```
**Expected:** your real Gmail address (not `your_email@gmail.com`).

---

## 1. Route count sanity

```bash
php artisan route:list --path=api | grep -cE '^\s+(GET|POST|PUT|PATCH|DELETE)'
```
**Expected:** `23`.

---

## 2. Register a fresh user — real verification email should arrive

```bash
TAG=$(date +%s)
EMAIL="verify+$TAG@example.com"

RESP=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"name\":\"Test $TAG\",\"email\":\"$EMAIL\",\"password\":\"$DEV_PASSWORD\",\"password_confirmation\":\"$DEV_PASSWORD\"}")

echo "$RESP" | jq '{id: .user.id, email: .user.email, verified: .email_verified}'

TOKEN=$(echo "$RESP" | jq -r .token)
USER_ID=$(echo "$RESP" | jq -r .user.id)

echo "TOKEN=$TOKEN"
echo "USER_ID=$USER_ID"

test "$USER_ID" != "null" && test -n "$USER_ID" && echo "OK" || echo "FAILED"
```
**Expected:** `id: <number>`, `verified: false`, `OK`. And an email arrives at `debugdevtest0@gmail.com` with subject "Verify your email address".

---

## 3. Trigger a fresh signed verification link (dev helper)

Instead of clicking through the email's link with its original signature, we ask Laravel for a fresh one:

```bash
SIGNED_PATH=$(php artisan tinker --execute="
echo Illuminate\Support\Facades\URL::temporarySignedRoute(
    'verification.verify',
    now()->addMinutes(60),
    ['id' => $USER_ID, 'hash' => sha1('$EMAIL')]
);
" | tail -n 1)

# Strip scheme+host so we don't double it when calling curl
SIGNED_REL=${SIGNED_PATH#http://localhost:8000}
SIGNED_REL=${SIGNED_REL#http://127.0.0.1:8000}

echo "SIGNED_REL=$SIGNED_REL"
test -n "$SIGNED_REL" && echo "OK" || echo "FAILED"
```
**Expected:** a path like `/api/email/verify/17/abc...?expires=...&signature=...` and `OK`.

---

## 4. Hit the signed link → email becomes verified

```bash
curl -s "http://localhost:8000$SIGNED_REL" \
  -H "Accept: application/json" | jq
```
**Expected:** `{ "message": "Email verified successfully." }`

Confirm via status endpoint:
```bash
curl -s http://localhost:8000/api/email/verification-status \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```
**Expected:** `verified: true`, `email_verified_at` non-null.

---

## 5. Idempotency — hitting the link again

```bash
curl -s "http://localhost:8000$SIGNED_REL" \
  -H "Accept: application/json" | jq
```
**Expected:** `{ "message": "Email already verified." }`

---

## 6. Tampered signature → 403

```bash
BADSIG=$(echo "$SIGNED_REL" | sed 's/signature=./signature=0/')
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://localhost:8000$BADSIG" -H "Accept: application/json"
```
**Expected:** `403`.

---

## 7. Resend — for already-verified user it's a no-op

```bash
curl -s -X POST http://localhost:8000/api/email/verification-notification \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq
```
**Expected:** `{ "message": "Email already verified." }`

Then register a second user and resend for them (email should arrive):
```bash
TAG2=$(date +%s)
EMAIL2="resend+$TAG2@example.com"
TOKEN2=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"name\":\"R $TAG2\",\"email\":\"$EMAIL2\",\"password\":\"$DEV_PASSWORD\",\"password_confirmation\":\"$DEV_PASSWORD\"}" \
  | jq -r .token)

curl -s -X POST http://localhost:8000/api/email/verification-notification \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN2" | jq
```
**Expected:** `{ "message": "Verification link sent." }` and a second email arrives.

---

## 8. Forgot password — real email arrives, response is neutral

```bash
curl -s -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\"}" | jq
```
**Expected:** `{ "message": "If that email is registered...", "status": "sent" }`. Email arrives with subject "Reset your password".

Unknown email — response must look identical:
```bash
curl -s -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"email":"nobody@nowhere.test"}' | jq
```
**Expected:** same shape, `status: "sent"`. **No user enumeration.**

---

## 9. Reset password with a token

Two ways to get the raw token — pick one:

**Option A: copy from the email.** Look at the "Reset your password" mail. The link looks like:
```
http://localhost:5173/reset-password?token=XXXXXXX&email=...
```
Copy the `XXXXXXX` part. Then:
```bash
RAW_RESET_TOKEN="paste-token-here"
```

**Option B: generate a fresh one via tinker** (dev-only helper). Write the helper to a file to dodge shell-quoting issues:

```bash
cat > /tmp/mk-reset-token.php <<'PHP'
<?php
require __DIR__.'/../../Desktop/VioletPro/TodoList/backend/vendor/autoload.php';
$app = require __DIR__.'/../../Desktop/VioletPro/TodoList/backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = getenv('R_EMAIL');
$user  = App\Models\User::where('email', $email)->first();
if (! $user) { fwrite(STDERR, "USER_NOT_FOUND\n"); exit(1); }

$raw = Illuminate\Support\Str::random(60);
Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
    ['email' => $user->email],
    ['token' => Illuminate\Support\Facades\Hash::make($raw), 'created_at' => now()]
);
echo $raw.PHP_EOL;
PHP
```

That path is fragile. Simpler: run the tinker command and immediately use the output, in the SAME shell session so `$EMAIL` is defined:

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
**Expected:** `OK` and a 60-char random string.

> **Important:** always run this in the SAME shell session where `$EMAIL` was set in Step 2, and do NOT close the terminal in between.







## Reset password with a token

Generate a fresh raw reset token via a small helper script (dev-only — in real life the token comes from the email link).

```bash
cat > mk-reset-token.php <<'PHP'
<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = getenv('R_EMAIL') ?: '';
if (!$email) { fwrite(STDERR, "no R_EMAIL env\n"); exit(1); }

$user = App\Models\User::where('email', $email)->first();
if (!$user) { fwrite(STDERR, "user not found: $email\n"); exit(1); }

$raw = Illuminate\Support\Str::random(60);
Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
    ['email' => $user->email],
    ['token' => Illuminate\Support\Facades\Hash::make($raw), 'created_at' => now()]
);
echo $raw.PHP_EOL;
PHP

RAW_RESET_TOKEN=$(R_EMAIL="$EMAIL" php mk-reset-token.php)
rm mk-reset-token.php

echo "RAW_RESET_TOKEN=$RAW_RESET_TOKEN"
test -n "$RAW_RESET_TOKEN" && echo "OK" || echo "FAILED"
```
**Expected:** a 60-char random string and `OK`.

**Critical:** `$EMAIL` must be set in the same shell. Do not close the terminal between Step 2 and this step.
---

## 10. Do the reset

```bash
NEWPASS="newpass4321"

curl -s -X POST http://localhost:8000/api/reset-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"token\":\"$RAW_RESET_TOKEN\",\"password\":\"$NEWPASS\",\"password_confirmation\":\"$NEWPASS\"}" | jq
```
**Expected:** `{ "message": "Your password has been reset." }`

Verify:
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
**Expected:** `422`, then `{ "email_verified": true }`.

---

## 11. Reset revokes old tokens

The `$TOKEN` from Step 2 should now be dead:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
**Expected:** `401`.

---

## 12. Reused token → invalid

```bash
curl -s -X POST http://localhost:8000/api/reset-password \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"token\":\"$RAW_RESET_TOKEN\",\"password\":\"whatever12\",\"password_confirmation\":\"whatever12\"}" \
  | jq '.errors // .message'
```
**Expected:** error containing "This password reset token is invalid."

---

## 13. Regression — old flows still work

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$NEWPASS\"}" | jq -r .token)

curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"regression","due_date":"2026-10-05"}' | jq '{id,title}'

curl -s "http://localhost:8000/api/tasks?week_start=$(date -d 'last monday' +%Y-%m-%d)" \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN" \
  | jq --arg t "regression" '[.[] | select(.title==$t)] | length'
```
**Expected:** a task JSON with `id` and `title`, then `1`.

---

## All green means:

- ✅ Registration returns token even if mail hiccups
- ✅ Verification email lands, link works, tampered sig 403s
- ✅ Resend works, no-op for verified users
- ✅ Forgot-password is neutral (no user enumeration)
- ✅ Reset changes password, revokes tokens, blocks reuse
- ✅ Old tasks endpoints still work