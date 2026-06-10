<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Enums\UserRole;
use App\Models\MedicalRecord;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicalRecordController extends Controller
{
    public function index(Request $request, Patient $patient): JsonResponse
    {
        $user = $request->user();

        if ($user?->role === UserRole::Patient->value) {
            abort_unless($user->patient?->is($patient), 403, 'No puedes ver historiales de otro paciente.');
        }

        return response()->json($patient->medicalRecords()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->abortUnlessStaff($user);

        $data = $request->validate([
            'appointment_id' => ['required', 'exists:appointments,id'],
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'consultation_reason' => ['required', 'string'],
            'symptoms' => ['nullable', 'string'],
            'blood_pressure' => ['nullable', 'string', 'max:50'],
            'temperature' => ['nullable', 'numeric'],
            'weight' => ['nullable', 'numeric'],
            'height' => ['nullable', 'numeric'],
            'diagnosis' => ['required', 'string'],
            'treatment' => ['nullable', 'string'],
            'recommendations' => ['nullable', 'string'],
            'next_control_at' => ['nullable', 'date'],
            'ai_summary' => ['nullable', 'string'],
        ]);

        // Un doctor solo puede registrar historiales a su propio nombre.
        if ($user->role === UserRole::Doctor->value) {
            $data['doctor_id'] = $user->id;
        }

        $record = MedicalRecord::create($data);
        $record->appointment()->update(['status' => AppointmentStatus::Completed->value]);

        return response()->json($record, 201);
    }
}
