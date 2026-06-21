<?php

use Illuminate\Support\Facades\Route;

// Catch all routes and let React Router handle them
Route::get('/{any}', function () {
    return view('spa');
})->where('any', '.*');
