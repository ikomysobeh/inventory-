<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin requests are allowed on
    | your Laravel application. By default, your CORS settings inherit those
    | values seen within the parent HTTP middleware configuration, though you
    | are free to change these values for each path on a per-route basis.
    |
    | To enable CORS for all your routes, you can use the middleware:
    | 'cors' => \Illuminate\Http\Middleware\HandleCors::class
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-token'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
