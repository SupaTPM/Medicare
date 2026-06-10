<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AILog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'input_payload',
        'output_payload',
    ];

    protected $casts = [
        'input_payload' => 'array',
        'output_payload' => 'array',
    ];
}
