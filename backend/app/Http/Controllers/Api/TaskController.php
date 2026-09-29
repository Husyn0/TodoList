<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'week_start' => 'required|date',
        ]);

        $start = Carbon::parse($request->week_start)->startOfDay();
        $end = $start->copy()->addDays(6)->endOfDay();

        $tasks = Task::where('user_id', $request->user()->id)
            ->whereBetween('due_date', [$start, $end])
            ->orderBy('position')
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'priority' => 'in:low,medium,high',
            'status' => 'in:pending,in_progress,done',
            'position' => 'integer',
        ]);

        $data['user_id'] = $request->user()->id;
        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorizeTask($request, $task);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'sometimes|date',
            'priority' => 'sometimes|in:low,medium,high',
            'status' => 'sometimes|in:pending,in_progress,done',
            'position' => 'sometimes|integer',
        ]);

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

    private function authorizeTask(Request $request, Task $task)
    {
        abort_if($task->user_id !== $request->user()->id, 403, 'Forbidden');
    }
}