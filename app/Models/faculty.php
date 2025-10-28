<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';

    protected $fillable = [
        'faculty_id',
        'first_name',
        'last_name',
        'middle_name',
        'date_of_birth',
        'gender',
        'personal_information',
        'department',
        'position',
        'attainment',
        'status',
        'email',
        'phone',
        'address'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];
}
