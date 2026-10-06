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
     * Browser lands here directly from the email link.
     * On success/failure we REDIRECT to the SPA (never return JSON here).
     */
    public function verify(Request $request, int $id, string $hash)
    {
        $frontend = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');

        $user = User::find($id);

        if (! $user) {
            return redirect("{$frontend}/verify-email?status=error&reason=user");
        }

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return redirect("{$frontend}/verify-email?status=error&reason=hash");
        }

        if ($user->hasVerifiedEmail()) {
            return redirect("{$frontend}/verify-email?status=success&already=1");
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect("{$frontend}/verify-email?status=success");
    }

    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Verification link sent.'], 202);
    }

    public function status(Request $request)
    {
        return response()->json([
            'verified'          => $request->user()->hasVerifiedEmail(),
            'email_verified_at' => $request->user()->email_verified_at,
        ]);
    }
}