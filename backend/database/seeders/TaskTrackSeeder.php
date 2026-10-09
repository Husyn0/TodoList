<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskTrack;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskTrackSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->firstOrFail();
        $task = Task::where('user_id', $user->id)
            ->where('title', 'Write project spec')
            ->first();

        if (! $task) {
            return;
        }

        TaskTrack::updateOrCreate(
            [
                'task_id' => $task->id,
                'date'    => now()->toDateString(),
            ],
            [
                'user_id' => $user->id,
                'status'  => 'done',
            ]
        );

        $this->command->info('✅ Task tracks seeded.');
    }
}
