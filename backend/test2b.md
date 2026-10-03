# Test 2b — Task & TaskTrack models

## Step 0: Cascade re-verify (SQL-level, one-liner)
```bash
php artisan tinker --execute="
\$t = App\Models\Task::create(['user_id'=>2,'title'=>'cascade test','due_date'=>'2026-10-06']);
DB::table('task_tracks')->insert(['user_id'=>2,'task_id'=>\$t->id,'date'=>'2026-10-06','status'=>'pending','created_at'=>now(),'updated_at'=>now()]);
echo 'tracks before: '.DB::table('task_tracks')->where('task_id',\$t->id)->count().PHP_EOL;
\$t->delete();
echo 'tracks after:  '.DB::table('task_tracks')->where('task_id',\$t->id)->count().PHP_EOL;
"
```
### Expected: `before: 1`, `after: 0`

---

## Step 1: Task model — mass-assign the new fields

```bash
php artisan tinker
```

```php
$u = App\Models\User::find(2);

$t = App\Models\Task::create([
    'user_id'       => $u->id,
    'title'         => 'Model test',
    'due_date'      => '2026-10-07',
    'repeat_preset' => 'custom',
    'repeat_days'   => ['monday','wednesday'],
    'meeting_time'  => '14:00:00',
]);

echo gettype($t->repeat_days).PHP_EOL;     // array
echo json_encode($t->repeat_days).PHP_EOL; // ["monday","wednesday"]
echo get_class($t->due_date).PHP_EOL;      // Illuminate\Support\Carbon
echo $t->meeting_time.PHP_EOL;             // 14:00:00
```

### Expected:
```
array
["monday","wednesday"]
Illuminate\Support\Carbon
14:00:00
```

---

## Step 2: TaskTrack model — create via relation

Still in tinker:
```php
$track = $t->tracks()->create([
    'user_id'      => $u->id,
    'date'         => '2026-10-07',
    'status'       => 'in_progress',
    'meeting_time' => '14:00:00',
]);

echo $track->id.PHP_EOL;
echo $track->task->title.PHP_EOL;   // Model test
echo $track->user->email.PHP_EOL;   // test@example.com
echo $t->fresh()->tracks->count().PHP_EOL; // 1
```

### Expected:
```
<some id>
Model test
test@example.com
1
```

---

## Step 3: Mass-assign guard — status should NOT be settable via track create if missing from fillable
(Actually it IS in fillable, so this should succeed — just a sanity check)

```php
$t2 = App\Models\Task::create([
    'user_id'  => $u->id,
    'title'    => 'No repeat',
    'due_date' => '2026-10-08',
]);
var_dump($t2->repeat_preset);  // "none"
var_dump($t2->repeat_days);    // null
var_dump($t2->meeting_time);   // null
```

### Expected: `string(4) "none"`, `NULL`, `NULL`

---

## Step 4: Cleanup test rows
```php
App\Models\Task::whereIn('title',['Model test','No repeat','cascade test'])->delete();
exit
```

### Expected: deletes 3 rows (and their tracks cascade).

---

## Step 5: Regression — API still works
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com","password":"password1234"}' \
  | grep -oP '"token":"\K[^"]+')

curl -s "http://localhost:8000/api/tasks?week_start=$(date -d 'last monday' +%Y-%m-%d)" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq '.[0]'
```
### Expected: JSON of a task — should now include `repeat_preset`, `repeat_days`, `meeting_time` in the payload automatically (because TaskController returns the model directly).

---

## Step 6: Confirm new fields appear in API output
```bash
curl -s "http://localhost:8000/api/tasks?week_start=$(date -d 'last monday' +%Y-%m-%d)" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.[0] | {id, title, repeat_preset, repeat_days, meeting_time}'
```
### Expected: all 5 keys present. `repeat_preset` likely `"none"`, `repeat_days` likely `null`, `meeting_time` likely `null` for old rows.