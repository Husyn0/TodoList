<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * GET /api/email/verify/{id}/{hash}
     * Called by the API from the frontend after the user clicks the email link.
     * The `signed` middleware already validated expires + signature.
     */
    public function verify(Request $request, int $id, string $hash)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return response()->json(['message' => 'Email verified successfully.']);
    }

    /**
     * POST /api/email/verification-notification
     * Requires auth. Resends the verification email.
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.'], 202);
    }

    /**
     * GET /api/email/verification-status
     * Requires auth. Reports whether the current user is verified.
     */
    public function status(Request $request)
    {
        return response()->json([
            'verified'          => $request->user()->hasVerifiedEmail(),
            'email_verified_at' => $request->user()->email_verified_at,
        ]);
    }
}