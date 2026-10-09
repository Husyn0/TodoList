<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'due_date',
        'priority',
        'status',
        'position',
        'repeat_preset',
        'repeat_days',
        'meeting_time',
        'period',
    ];

    protected $casts = [
        'due_date'    => 'date',
        'repeat_days' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tracks()
    {
        return $this->hasMany(TaskTrack::class);
    }
}