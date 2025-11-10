<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'courses';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'course_code',
        'course_name',
        'description',
        'department_id',
        'is_archived',
    ];

    /**
     * Get the department that the course belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
