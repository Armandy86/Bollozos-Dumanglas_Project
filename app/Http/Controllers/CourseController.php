<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Get all courses
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiIndex()
    {
        $courses = Course::with('department')->orderBy('course_code')->get();
        return response()->json($courses);
    }

    /**
     * Store a new course
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'course_code' => ['required', 'string', 'max:255', 'unique:courses,course_code'],
                'course_name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'department_id' => ['nullable', 'exists:department,id'],
            ]);

            $course = Course::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Course created successfully',
                'data' => $course->load('department')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific course
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiShow($id)
    {
        $course = Course::with('department')->find($id);
        
        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found'
            ], 404);
        }

        return response()->json($course);
    }

    /**
     * Update a course
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiUpdate(Request $request, $id)
    {
        try {
            $course = Course::find($id);
            
            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            $validated = $request->validate([
                'course_code' => ['required', 'string', 'max:255', 'unique:courses,course_code,' . $id],
                'course_name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'department_id' => ['nullable', 'exists:department,id'],
                'is_archived' => ['nullable', 'boolean'],
            ]);

            $course->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $course->load('department')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Archive/Unarchive a course
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiArchive($id)
    {
        try {
            $course = Course::find($id);
            
            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            $course->is_archived = !$course->is_archived;
            $course->save();

            return response()->json([
                'success' => true,
                'message' => $course->is_archived ? 'Course archived successfully' : 'Course unarchived successfully',
                'data' => $course->load('department')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to archive course: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a course
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiDestroy($id)
    {
        try {
            $course = Course::find($id);
            
            if (!$course) {
                return response()->json([
                    'success' => false,
                    'message' => 'Course not found'
                ], 404);
            }

            $course->delete();

            return response()->json([
                'success' => true,
                'message' => 'Course deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete course: ' . $e->getMessage()
            ], 500);
        }
    }
}
