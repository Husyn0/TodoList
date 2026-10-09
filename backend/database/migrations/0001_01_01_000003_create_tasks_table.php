<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date');

            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'done'])->default('pending');
            $table->unsignedInteger('position')->default(0);

            // Recurrence
            $table->enum('repeat_preset', ['none', 'daily', 'weekly', 'custom'])->default('none');
            $table->json('repeat_days')->nullable();

            // Time of day
            $table->time('meeting_time')->nullable();
            $table->enum('period', ['morning', 'afternoon', 'evening', 'night'])->nullable();

            $table->timestamps();

            $table->index(['user_id', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};