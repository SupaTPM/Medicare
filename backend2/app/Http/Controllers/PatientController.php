<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Patient::latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'cedula' => ['required', 'string', 'max:20', 'unique:patients,cedula'],
            'birth_date' => ['nullable', 'date'],
            'sex' => ['nullable', 'string', 'max:20'],
            'blood_type' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'emergency_contact' => ['nullable', 'string'],
            'allergies' => ['nullable', 'array'],
            'previous_conditions' => ['nullable', 'array'],
            'current_medications' => ['nullable', 'array'],
            'insurance_name' => ['nullable', 'string', 'max:255'],
        ]);

        $patient = Patient::create($data);

        return response()->json($patient, 201);
    }

    public function show(Patient $patient): JsonResponse
    {
        return response()->json($patient->load(['appointments', 'medicalRecords', 'documents']));
    }

    public function update(Request $request, Patient $patient): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:255'],
            'cedula' => ['sometimes', 'string', 'max:20', 'unique:patients,cedula,' . $patient->id],
            'birth_date' => ['nullable', 'date'],
            'sex' => ['nullable', 'string', 'max:20'],
            'blood_type' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'emergency_contact' => ['nullable', 'string'],
            'allergies' => ['nullable', 'array'],
            'previous_conditions' => ['nullable', 'array'],
            'current_medications' => ['nullable', 'array'],
            'insurance_name' => ['nullable', 'string', 'max:255'],
        ]);

        $patient->update($data);

        return response()->json($patient->refresh());
    }

    public function search(Request $request): JsonResponse
    {
        $query = (string) $request->query('query', '');

        $patients = Patient::query()
            ->where('cedula', 'like', "%{$query}%")
            ->orWhere('full_name', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json($patients);
    }
}
