<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TrackController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\PasswordResetController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Guest password reset
Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/reset-password',  [PasswordResetController::class, 'reset']);

// Email verification — signed URL, no auth required (id + hash + signature are the auth)
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware('signed')
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Resend verification / check status
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend']);
    Route::get('/email/verification-status',        [EmailVerificationController::class, 'status']);

    // Tasks
    Route::get('/tasks',           [TaskController::class, 'index']);
    Route::get('/tasks/range',     [TaskController::class, 'range']);
    Route::post('/tasks',          [TaskController::class, 'store']);
    Route::put('/tasks/{task}',    [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
    Route::patch('/tasks/{task}/move', [TaskController::class, 'move']);

    // Tracks
    Route::get('/tracks',      [TrackController::class, 'index']);
    Route::delete('/tracks/task/{task}', [TrackController::class, 'destroyForTask']);
    Route::put('/tracks/{task}/{date}',  [TrackController::class, 'upsert']);
    Route::delete('/tracks/{task}/{date}', [TrackController::class, 'destroy']);

    // Settings
    Route::get('/settings',          [SettingsController::class, 'show']);
    Route::put('/settings',          [SettingsController::class, 'update']);
    Route::put('/settings/password', [SettingsController::class, 'updatePassword']);
});