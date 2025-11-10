<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\facultyController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AcademicYearController;




Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Auth routes
Route::post('/login', [UserController::class, 'login']);
Route::post('/user/change-password', [UserController::class, 'changePassword']);

// Profile routes
Route::get('/profile', [UserController::class, 'getProfile']);
Route::put('/profile', [UserController::class, 'updateProfile']);

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

Route::get('/departments', [DepartmentController::class, 'apiIndex']);
Route::post('/departments', [DepartmentController::class, 'apiStore']);
Route::get('/departments/{id}', [DepartmentController::class, 'apiShow']);
Route::put('/departments/{id}', [DepartmentController::class, 'apiUpdate']);
Route::patch('/departments/{id}/archive', [DepartmentController::class, 'apiArchive']);
Route::delete('/departments/{id}', [DepartmentController::class, 'apiDestroy']);

Route::get('/courses', [CourseController::class, 'apiIndex']);
Route::post('/courses', [CourseController::class, 'apiStore']);
Route::get('/courses/{id}', [CourseController::class, 'apiShow']);
Route::put('/courses/{id}', [CourseController::class, 'apiUpdate']);
Route::patch('/courses/{id}/archive', [CourseController::class, 'apiArchive']);
Route::delete('/courses/{id}', [CourseController::class, 'apiDestroy']);

Route::get('/academic-years', [AcademicYearController::class, 'apiIndex']);
Route::post('/academic-years', [AcademicYearController::class, 'apiStore']);
Route::get('/academic-years/{id}', [AcademicYearController::class, 'apiShow']);
Route::put('/academic-years/{id}', [AcademicYearController::class, 'apiUpdate']);
Route::patch('/academic-years/{id}/archive', [AcademicYearController::class, 'apiArchive']);
Route::delete('/academic-years/{id}', [AcademicYearController::class, 'apiDestroy']);
