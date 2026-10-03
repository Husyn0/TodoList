# Test 2 — Migrations: repeat fields on tasks + new task_tracks table

## Step 0: Sanity — current schema BEFORE migration

### Show tasks columns (should NOT yet contain repeat_preset / repeat_days / meeting_time):
```bash
php artisan tinker --execute="print_r(\Illuminate\Support\Facades\Schema::getColumnListing('tasks'));"
```

### Confirm task_tracks table does NOT exist yet:
```bash
php artisan tinker --execute="var_dump(\Illuminate\Support\Facades\Schema::hasTable('task_tracks'));"
```
### Expected: `bool(false)`

---

## Step 1: Run the migrations

```bash
php artisan migrate
```

### Expected output includes:
```
  2026_10_03_000001_add_repeat_and_meeting_to_tasks_table ....... DONE
  2026_10_03_000002_create_task_tracks_table ................... DONE
```

---

## Step 2: Verify `tasks` new columns exist

```bash
php artisan tinker --execute="print_r(\Illuminate\Support\Facades\Schema::getColumnListing('tasks'));"
```
### Expected: list now includes `repeat_preset`, `repeat_days`, `meeting_time`.

### Verify column types / nullability / default:
```bash
php artisan db:table tasks
```
Look for:
- `repeat_preset` → enum, default `none`, not null
- `repeat_days` → json, nullable
- `meeting_time` → time, nullable

---

## Step 3: Verify `task_tracks` schema

```bash
php artisan db:table task_tracks
```
### Expected columns:
`id, user_id, task_id, date, status, meeting_time, created_at, updated_at`

### Expected indexes:
- PRIMARY on `id`
- UNIQUE `task_tracks_task_id_date_unique` on (`task_id`, `date`)
- INDEX `task_tracks_user_id_date_index` on (`user_id`, `date`)
- FKs to `users` and `tasks`, both `ON DELETE CASCADE`

### Or via SQL:
```bash
php artisan db:table task_tracks --json | jq
```

---

## Step 4: Smoke — insert a task with repeat + a track row via tinker

### Pick an existing user id (use id=2 from your dump, adjust if needed):
```bash
php artisan tinker
```

Inside tinker:
```php
$u = App\Models\User::find(2);

$t = App\Models\Task::create([
    'user_id'      => $u->id,
    'title'        => 'Test repeat task',
    'due_date'     => '2026-10-06',           // a Monday
    'priority'     => 'medium',
    'status'       => 'pending',
    'position'     => 0,
    'repeat_preset'=> 'custom',
    'repeat_days'  => ['monday','wednesday','friday'],
    'meeting_time' => '09:30:00',
]);

$t->id; // note this id, e.g. 36
```

### Verify the repeat_days round-trips as array:
```php
App\Models\Task::find($t->id)->repeat_days;   // => ["monday","wednesday","friday"]
```

Now insert a track manually (model doesn't exist yet — use DB facade):
```php
DB::table('task_tracks')->insert([
    'user_id'      => $u->id,
    'task_id'      => $t->id,
    'date'         => '2026-10-06',
    'status'       => 'in_progress',
    'meeting_time' => '09:30:00',
    'created_at'   => now(),
    'updated_at'   => now(),
]);

DB::table('task_tracks')->where('task_id', $t->id)->get();
```
### Expected: one row, `status = in_progress`.

---

## Step 5: Verify UNIQUE(task_id, date) is enforced

In tinker, try to insert the same (task_id, date) again:
```php
DB::table('task_tracks')->insert([
    'user_id' => $u->id, 'task_id' => $t->id, 'date' => '2026-10-06',
    'status' => 'pending', 'created_at' => now(), 'updated_at' => now(),
]);
```
### Expected: `Illuminate\Database\QueryException` — duplicate entry.

Exit tinker:
```php
exit
```

---

## Step 6: Verify CASCADE delete

### Delete the task → its tracks should vanish too.

In tinker:
```php
$before = DB::table('task_tracks')->where('task_id', $t->id)->count();
echo "tracks before: $before\n";

App\Models\Task::find($t->id)->delete();

$after = DB::table('task_tracks')->where('task_id', $t->id)->count();
echo "tracks after: $after\n";
```
### Expected: `before: 1`, `after: 0`

---

## Step 7: Regression — old endpoints still work

Re-run the first few steps of `test1.md`:

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -oP '"token":"\K[^"]+')

curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
### Expected: 200, user JSON. Old columns still present, new columns ignored gracefully (Task model fillable doesn't include them yet — that's Item B).

---

## Step 8: Rollback test (optional but recommended)

```bash
php artisan migrate:rollback --step=2
```
### Expected: both migrations rolled back without error.
### Then re-apply:
```bash
php artisan migrate
```