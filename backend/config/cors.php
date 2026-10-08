<?php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',       // Vite dev
        'tauri://localhost',           // Tauri (macOS/Linux)
        'https://tauri.localhost',     // Tauri (Windows)
        'http://tauri.localhost',      // Tauri (some Windows builds)
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];