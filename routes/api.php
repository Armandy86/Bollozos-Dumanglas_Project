<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\facultyController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/students', [StudentController::class, 'apiIndex']);
Route::post('/students', [StudentController::class, 'apiStore']);
Route::get('/students/{id}', [StudentController::class, 'apiShow']);
Route::put('/students/{id}', [StudentController::class, 'apiUpdate']);
Route::delete('/students/{id}', [StudentController::class, 'apiDestroy']);

Route::get('/faculty', [facultyController::class, 'apiIndex']);
Route::post('/faculty', [facultyController::class, 'apiStore']);
Route::get('/faculty/{id}', [facultyController::class, 'apiShow']);
Route::put('/faculty/{id}', [facultyController::class, 'apiUpdate']);
Route::delete('/faculty/{id}', [facultyController::class, 'apiDestroy']);
