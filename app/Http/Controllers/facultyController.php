<?php

namespace App\Http\Controllers;

use App\Models\faculty;
use Illuminate\Http\Request;

class facultyController extends Controller
{
    public function index()
    {
        $faculty = faculty::latest()->get();
        return view('faculty', compact('faculty'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'faculty_id' => ['nullable', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'personal_information' => ['nullable', 'string'],
            'department' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'attainment' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
        ]);

        faculty::create($validated);

        return redirect()->back()->with('status', 'Faculty added.');
    }

    public function apiIndex()
    {
        $faculty = faculty::latest()->get();
        return response()->json($faculty);
    }

    public function apiStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'faculty_id' => ['nullable', 'string', 'max:255'],
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'middle_name' => ['nullable', 'string', 'max:255'],
                'date_of_birth' => ['nullable', 'date'],
                'gender' => ['nullable', 'string', 'max:50'],
                'personal_information' => ['nullable', 'string'],
                'department' => ['nullable', 'string', 'max:255'],
                'position' => ['nullable', 'string', 'max:255'],
                'attainment' => ['nullable', 'string', 'max:255'],
                'status' => ['nullable', 'string', 'max:50'],
                'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string'],
            ]);

            $faculty = faculty::create($validated);

            return response()->json([
                'message' => 'Faculty added successfully',
                'faculty' => $faculty
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add faculty',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function apiShow($id)
    {
        try {
            $faculty = faculty::findOrFail($id);
            return response()->json($faculty);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Faculty not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        try {
            $faculty = faculty::findOrFail($id);
            
            $validated = $request->validate([
                'faculty_id' => ['nullable', 'string', 'max:255'],
                'first_name' => ['required', 'string', 'max:255'],
                'last_name' => ['required', 'string', 'max:255'],
                'middle_name' => ['nullable', 'string', 'max:255'],
                'date_of_birth' => ['nullable', 'date'],
                'gender' => ['nullable', 'string', 'max:50'],
                'personal_information' => ['nullable', 'string'],
                'department' => ['nullable', 'string', 'max:255'],
                'position' => ['nullable', 'string', 'max:255'],
                'attainment' => ['nullable', 'string', 'max:255'],
                'status' => ['nullable', 'string', 'max:50'],
                'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:50'],
                'address' => ['nullable', 'string'],
            ]);

            $faculty->update($validated);

            return response()->json([
                'message' => 'Faculty updated successfully',
                'faculty' => $faculty
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update faculty',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDestroy($id)
    {
        try {
            $faculty = faculty::findOrFail($id);
            $faculty->delete();

            return response()->json([
                'message' => 'Faculty deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete faculty',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
