<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'cedula',
        'birth_date',
        'sex',
        'blood_type',
        'phone',
        'email',
        'address',
        'emergency_contact',
        'allergies',
        'previous_conditions',
        'current_medications',
        'chronic_conditions',
        'has_disability',
        'disability_type',
        'disability_percentage',
        'insurance_name',
        'profile_completed_at',
    ];

    protected $casts = [
        'allergies' => 'array',
        'previous_conditions' => 'array',
        'current_medications' => 'array',
        'chronic_conditions' => 'array',
        'has_disability' => 'boolean',
        'birth_date' => 'date',
        'profile_completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(MedicalDocument::class);
    }
}
