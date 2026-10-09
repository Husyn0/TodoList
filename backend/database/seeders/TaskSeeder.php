<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $user  = User::where('email', 'test@example.com')->firstOrFail();
        $today = now()->startOfDay();

        $tasks = [
            [
                'title'    => 'Write project spec',
                'description' => 'Draft the initial requirements doc',
                'due_date' => $today->copy()->subDay(),
                'priority' => 'high',
                'status'   => 'done',
                'period'   => 'morning',
            ],
            [
                'title'    => 'Review PRs',
                'due_date' => $today,
                'priority' => 'medium',
                'status'   => 'in_progress',
                'period'   => 'afternoon',
                'meeting_time' => '14:30',
            ],
            [
                'title'    => 'Team sync',
                'due_date' => $today,
                'priority' => 'medium',
                'status'   => 'pending',
                'period'   => 'evening',
                'meeting_time' => '18:00',
                'repeat_preset' => 'custom',
                'repeat_days'   => ['monday', 'wednesday'],
            ],
            [
                'title'    => 'Exercise',
                'due_date' => $today->copy()->addDay(),
                'priority' => 'high',
                'status'   => 'pending',
                'period'   => 'morning',
            ],
            [
                'title'    => 'Automotors backend',
                'due_date' => $today->copy()->addDays(2),
                'priority' => 'low',
                'status'   => 'pending',
                'period'   => 'afternoon',
            ],
        ];

        foreach ($tasks as $i => $data) {
            Task::updateOrCreate(
                [
                    'user_id'  => $user->id,
                    'title'    => $data['title'],
                    'due_date' => $data['due_date'],
                ],
                array_merge($data, [
                    'user_id'  => $user->id,
                    'position' => $i,
                ])
            );
        }

        $this->command->info('✅ Tasks seeded.');
    }
}