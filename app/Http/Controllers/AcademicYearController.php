<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    /**
     * Get all academic years
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiIndex()
    {
        $academicYears = AcademicYear::orderBy('year_start', 'desc')->get();
        return response()->json($academicYears);
    }

    /**
     * Store a new academic year
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'year_start' => ['required', 'string', 'max:255'],
                'year_end' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
            ]);

            $academicYear = AcademicYear::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Academic year created successfully',
                'data' => $academicYear
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create academic year: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific academic year
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiShow($id)
    {
        $academicYear = AcademicYear::find($id);
        
        if (!$academicYear) {
            return response()->json([
                'success' => false,
                'message' => 'Academic year not found'
            ], 404);
        }

        return response()->json($academicYear);
    }

    /**
     * Update an academic year
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiUpdate(Request $request, $id)
    {
        try {
            $academicYear = AcademicYear::find($id);
            
            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found'
                ], 404);
            }

            $validated = $request->validate([
                'year_start' => ['required', 'string', 'max:255'],
                'year_end' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'is_archived' => ['nullable', 'boolean'],
            ]);

            $academicYear->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Academic year updated successfully',
                'data' => $academicYear
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update academic year: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive/Unarchive an academic year
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiArchive($id)
    {
        try {
            $academicYear = AcademicYear::find($id);
            
            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found'
                ], 404);
            }

            $academicYear->is_archived = !$academicYear->is_archived;
            $academicYear->save();

            return response()->json([
                'success' => true,
                'message' => $academicYear->is_archived ? 'Academic year archived successfully' : 'Academic year unarchived successfully',
                'data' => $academicYear
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive academic year: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an academic year
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiDestroy($id)
    {
        try {
            $academicYear = AcademicYear::find($id);
            
            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found'
                ], 404);
            }

            $academicYear->delete();

            return response()->json([
                'success' => true,
                'message' => 'Academic year deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete academic year: ' . $e->getMessage()
            ], 500);
        }
    }
}
