<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_tracks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('task_id')
                  ->constrained('tasks')
                  ->cascadeOnDelete();

            $table->date('date');

            $table->enum('status', ['pending', 'in_progress', 'done'])
                  ->default('pending');

            $table->time('meeting_time')->nullable();

            $table->timestamps();

            $table->unique(['task_id', 'date'], 'task_tracks_task_id_date_unique');
            $table->index(['user_id', 'date'], 'task_tracks_user_id_date_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_tracks');
    }
};