<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class TaskController extends Controller
{
    private const REPEAT_PRESETS = ['none', 'daily', 'weekly', 'custom'];
    private const REPEAT_DAYS    = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

    public function index(Request $request)
    {
        $request->validate([
            'week_start' => 'required|date',
        ]);

        $start = Carbon::parse($request->week_start)->startOfDay();
        $end   = $start->copy()->addDays(6)->endOfDay();

        $tasks = Task::where('user_id', $request->user()->id)
            ->whereBetween('due_date', [$start, $end])
            ->orderBy('position')
            ->get();

        return response()->json($tasks);
    }

    /**
     * GET /api/tasks/range?from=YYYY-MM-DD&to=YYYY-MM-DD
     * Returns tasks whose due_date falls inside range, with tracks eager-loaded
     * inside the same range. Used by the frontend dashboard/heatmap.
     */
    public function range(Request $request)
    {
        $data = $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $from = Carbon::parse($data['from'])->startOfDay();
        $to   = Carbon::parse($data['to'])->endOfDay();

        $tasks = Task::where('user_id', $request->user()->id)
            ->whereBetween('due_date', [$from, $to])
            ->with(['tracks' => function ($q) use ($from, $to) {
                $q->whereBetween('date', [$from->toDateString(), $to->toDateString()]);
            }])
            ->orderBy('due_date')
            ->orderBy('position')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());

        $data['user_id'] = $request->user()->id;
        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorizeTask($request, $task);

        $data = $request->validate($this->rules(forUpdate: true));
        $task->update($data);

        return response()->json($task);
    }

    public function destroy(Request $request, Task $task)
    {
        $this->authorizeTask($request, $task);
        $task->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function move(Request $request, Task $task)
    {
        $this->authorizeTask($request, $task);

        $data = $request->validate([
            'due_date' => 'required|date',
            'position' => 'integer',
        ]);

        $task->update($data);
        return response()->json($task);
    }

    private function rules(bool $forUpdate = false): array
    {
        $req = $forUpdate ? 'sometimes' : 'required';

        return [
            'title'         => "$req|string|max:255",
            'description'   => 'nullable|string',
            'due_date'      => "$req|date",
            'priority'      => 'sometimes|in:low,medium,high',
            'status'        => 'sometimes|in:pending,in_progress,done',
            'position'      => 'sometimes|integer',

            'repeat_preset' => ['sometimes', Rule::in(self::REPEAT_PRESETS)],
            'repeat_days'   => ['nullable', 'array'],
            'repeat_days.*' => ['string', Rule::in(self::REPEAT_DAYS)],
            'meeting_time'  => ['nullable', 'date_format:H:i'],
        ];
    }

    private function authorizeTask(Request $request, Task $task)
    {
        abort_if($task->user_id !== $request->user()->id, 403, 'Forbidden');
    }
}