<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'name'       => $request->user()->name,
            'email'      => $request->user()->email,
            'theme'      => $request->user()->theme,
            'timezone'   => $request->user()->timezone,
            'week_start' => $request->user()->week_start,
            'week_end'   => $request->user()->week_end,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'theme'      => 'sometimes|in:light,dark',
            'timezone'   => 'sometimes|string',
            'week_start' => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'week_end'   => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
        ]);

        $request->user()->update($data);
        return response()->json(['message' => 'Updated', 'user' => $request->user()]);
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        if (!\Hash::check($data['current_password'], $request->user()->password)) {
            return response()->json(['message' => 'Current password is wrong'], 422);
        }

        $request->user()->update(['password' => \Hash::make($data['password'])]);
        return response()->json(['message' => 'Password updated']);
    }
}