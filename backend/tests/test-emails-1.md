# Email Tests — Batch 1: Config & User model

Confirms env values, mail config, and MustVerifyEmail interface are wired before we touch controllers.

---

## 0. Sanity — server up

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/me
```
**Expected:** `401`.

---

## 1. Mail config is loaded (not the default `log`)

```bash
php artisan tinker --execute="echo config('mail.default').PHP_EOL;"
```
**Expected:** `smtp` (or `resend`/whatever provider you set). **Not** `log`.

---

## 2. Mail host / from are set

```bash
php artisan tinker --execute="
echo 'host:  '.config('mail.mailers.smtp.host').PHP_EOL;
echo 'from:  '.config('mail.from.address').PHP_EOL;
"
```
**Expected:** your SMTP host and the `MAIL_FROM_ADDRESS` you set.

---

## 3. Frontend config is loaded

```bash
php artisan tinker --execute="
echo 'frontend url:   '.config('services.frontend.url').PHP_EOL;
echo 'verify path:    '.config('services.frontend.verify_path').PHP_EOL;
echo 'reset path:     '.config('services.frontend.reset_path').PHP_EOL;
"
```
**Expected:**
```
frontend url:   http://localhost:5173
verify path:    /verify-email
reset path:     /reset-password
```

---

## 4. User implements MustVerifyEmail

```bash
php artisan tinker --execute="
\$u = App\Models\User::first();
echo 'interfaces: '.implode(',', class_implements(\$u)).PHP_EOL;
echo 'hasVerifiedEmail: '.var_export(\$u->hasVerifiedEmail(), true).PHP_EOL;
"
```
**Expected:** `interfaces:` line contains `Illuminate\Contracts\Auth\MustVerifyEmail`. `hasVerifiedEmail` → `false` for your existing user (since `email_verified_at` is null in the dump).

---

## 5. Register a fresh user and confirm they are unverified

```bash
EMAIL="verify1+$(date +%s)@example.com"

curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"name\":\"V1\",\"email\":\"$EMAIL\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}" \
  | jq '{email: .user.email, id: .user.id}'

php artisan tinker --execute="
\$u = App\Models\User::where('email', '$EMAIL')->first();
echo 'verified_at: '.var_export(\$u->email_verified_at, true).PHP_EOL;
echo 'hasVerified: '.var_export(\$u->hasVerifiedEmail(), true).PHP_EOL;
"
```
**Expected:** user created; `verified_at: NULL`; `hasVerified: false`. **No email sent yet** — that's Batch 2.

---

## 6. `password_reset_tokens` table is present and empty

```bash
php artisan db:table password_reset_tokens
```
**Expected:** 3 columns (`email` PK, `token`, `created_at`). Empty is fine.

---

## 7. Route list unchanged

```bash
php artisan route:list --path=api | wc -l
```
**Expected:** same count as before (~18 rows + a few header/footer lines). No new routes yet.

---

## Batch 1 green means:

- ✅ `.env` picked up — `MAIL_MAILER` no longer `log`
- ✅ `config('services.frontend.*')` readable
- ✅ `User implements MustVerifyEmail`
- ✅ New users land unverified
- ✅ No routes broken