<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Exceptions\InvalidSignatureException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') && ! $request->is('api/email/verify/*'),
        );

        // Invalid/expired signed link → redirect to SPA, don't dump JSON
        $exceptions->render(function (InvalidSignatureException $e, Request $request) {
            if ($request->is('api/email/verify/*')) {
                $frontend = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
                return redirect("{$frontend}/verify-email?status=error&reason=sig");
            }
            return null; // fall through to default handler
        });
    })->create();