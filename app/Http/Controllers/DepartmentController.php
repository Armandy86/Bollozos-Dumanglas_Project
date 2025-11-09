<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Get all departments
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiIndex()
    {
        $departments = Department::orderBy('name')->get();
        return response()->json($departments);
    }

    /**
     * Store a new department
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:department,name'],
            ]);

            $department = Department::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => $department
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific department
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiShow($id)
    {
        $department = Department::find($id);
        
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        return response()->json($department);
    }

    /**
     * Update a department
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiUpdate(Request $request, $id)
    {
        try {
            $department = Department::find($id);
            
            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found'
                ], 404);
            }

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:department,name,' . $id],
            ]);

            $department->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Department updated successfully',
                'data' => $department
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update department: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a department
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiDestroy($id)
    {
        try {
            $department = Department::find($id);
            
            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found'
                ], 404);
            }

            $department->delete();

            return response()->json([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete department: ' . $e->getMessage()
            ], 500);
        }
    }
}

