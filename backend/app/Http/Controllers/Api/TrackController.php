<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskTrack;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class TrackController extends Controller
{
    /**
     * GET /api/tracks?from=&to=
     * All tracks for the authenticated user in a date range.
     */
    public function index(Request $request)
    {
        $data = $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $tracks = TaskTrack::where('user_id', $request->user()->id)
            ->whereBetween('date', [
                Carbon::parse($data['from'])->toDateString(),
                Carbon::parse($data['to'])->toDateString(),
            ])
            ->get();

        return response()->json($tracks);
    }

    /**
     * PUT /api/tracks/{task}/{date}
     * Upsert a track for (task, date). date = YYYY-MM-DD.
     */
    public function upsert(Request $request, Task $task, string $date)
    {
        $this->authorizeTask($request, $task);

        // Validate date format & normalise
        $date = Carbon::parse($date)->toDateString();

        $data = $request->validate([
            'status'       => ['sometimes', Rule::in(['pending','in_progress','done'])],
            'meeting_time' => ['nullable', 'date_format:H:i'],
        ]);

        $track = TaskTrack::updateOrCreate(
            [
                'task_id' => $task->id,
                'date'    => $date,
            ],
            array_merge($data, [
                'user_id' => $request->user()->id,
            ])
        );

        return response()->json($track);
    }

    /**
     * DELETE /api/tracks/{task}/{date}
     */
    public function destroy(Request $request, Task $task, string $date)
    {
        $this->authorizeTask($request, $task);
        $date = Carbon::parse($date)->toDateString();

        TaskTrack::where('task_id', $task->id)
            ->where('date', $date)
            ->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * DELETE /api/tracks/task/{task}
     * Remove all tracks for a task (used when the task is deleted or edited heavily).
     */
    public function destroyForTask(Request $request, Task $task)
    {
        $this->authorizeTask($request, $task);
        TaskTrack::where('task_id', $task->id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function authorizeTask(Request $request, Task $task)
    {
        abort_if($task->user_id !== $request->user()->id, 403, 'Forbidden');
    }
}