<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::latest()->get();
        return view('home', compact('students'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['nullable', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'personal_information' => ['nullable', 'string'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'program' => ['nullable', 'string', 'max:255'],
            'year_level' => ['nullable', 'string', 'max:50'],
            'section' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
            'academic_year_id' => ['nullable', 'integer', 'exists:academic_years,id'],
        ]);

        Student::create($validated);

        return redirect()->back()->with('status', 'Student added.');
    }

    public function apiIndex()
    {
        $students = Student::whereNull('deleted_at')->latest()->get();
        return response()->json($students);
    }

    public function apiStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => ['nullable', 'string', 'max:255'],
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'middle_name' => ['nullable', 'string', 'max:255'],
                'date_of_birth' => ['nullable', 'date'],
                'gender' => ['nullable', 'string', 'max:50'],
                'personal_information' => ['nullable', 'string'],
                'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string'],
                'program' => ['nullable', 'string', 'max:255'],
                'year_level' => ['nullable', 'string', 'max:50'],
                'section' => ['nullable', 'string', 'max:255'],
                'status' => ['nullable', 'string', 'max:50'],
            ]);

            $student = Student::create($validated);

            return response()->json([
                'message' => 'Student added successfully',
                'student' => $student
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function apiShow($id)
    {
        try {
            $student = Student::findOrFail($id);
            return response()->json($student);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Student not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        try {
            $student = Student::findOrFail($id);
            
            $validated = $request->validate([
                'student_id' => ['nullable', 'string', 'max:255'],
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'middle_name' => ['nullable', 'string', 'max:255'],
                'date_of_birth' => ['nullable', 'date'],
                'gender' => ['nullable', 'string', 'max:50'],
                'personal_information' => ['nullable', 'string'],
                'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string'],
                'program' => ['nullable', 'string', 'max:255'],
                'year_level' => ['nullable', 'string', 'max:50'],
                'section' => ['nullable', 'string', 'max:255'],
                'status' => ['nullable', 'string', 'max:50'],
            ]);

            $student->update($validated);

            return response()->json([
                'message' => 'Student updated successfully',
                'student' => $student
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDestroy($id)
    {
        try {
            $student = Student::findOrFail($id);
            $student->delete();

            return response()->json([
                'message' => 'Student archived successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to archive student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function apiArchived()
    {
        try {
            $students = Student::onlyTrashed()->latest()->get();
            return response()->json($students);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch archived students',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function apiRestore($id)
    {
        try {
            $student = Student::withTrashed()->findOrFail($id);
            $student->restore();

            return response()->json([
                'message' => 'Student restored successfully',
                'student' => $student
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to restore student',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}




