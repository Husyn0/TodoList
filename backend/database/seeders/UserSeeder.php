<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Primary demo user — deterministic credentials
        User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name'              => 'Test User',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'theme'             => 'dark',
                'timezone'          => 'Asia/Beirut',
                'week_start'        => 'monday',
                'week_end'          => 'sunday',
            ]
        );

        // A few random users for testing
        User::factory()->count(5)->create();

        $this->command->info('✅ Users seeded.');
    }
}