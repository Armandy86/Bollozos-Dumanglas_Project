<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('dashboard');
});

Route::get('/login', function () {
    return view('login');
});

Route::get('/home', [StudentController::class, 'index']);
Route::get('/react-home', function () {
    return view('react-home');
});
Route::post('/students', [StudentController::class, 'store'])->name('students.store');

Route::get('/example/{any?}', function () {
    return view('example');
})->where('any', '^(?!api).*$');