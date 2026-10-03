<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->enum('repeat_preset', ['none', 'daily', 'weekly', 'custom'])
                  ->default('none')
                  ->after('position');

            $table->json('repeat_days')
                  ->nullable()
                  ->after('repeat_preset');

            $table->time('meeting_time')
                  ->nullable()
                  ->after('repeat_days');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['repeat_preset', 'repeat_days', 'meeting_time']);
        });
    }
};