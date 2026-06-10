<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PatientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Patient::query()->latest();

        if ($user?->role === UserRole::Patient->value) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $this->abortUnlessStaff($request->user());

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
            'chronic_conditions' => ['nullable', 'array'],
            'has_disability' => ['nullable', 'boolean'],
            'disability_type' => ['nullable', 'string', 'max:255'],
            'disability_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'insurance_name' => ['nullable', 'string', 'max:255'],
        ]);

        $patient = Patient::create($data);

        if (! empty($data['cedula'])) {
            $user = $this->upsertPatientUser($data['cedula'], $data['full_name']);
            $patient->update(['user_id' => $user->id]);
        }

        return response()->json($patient, 201);
    }

    public function deviceRegistration(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'cedula' => ['required', 'string', 'max:20'],
        ]);

        $user = $this->upsertPatientUser($data['cedula'], $data['full_name']);
        $patient = $this->upsertPatient($data['cedula'], $data['full_name'], $user->id);

        return response()->json([
            'token' => $user->createToken('patient-mobile')->plainTextToken,
            'user' => $user->load('patient'),
            'patient' => $patient,
        ], $patient->wasRecentlyCreated ? 201 : 200);
    }

    public function cedulaLogin(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cedula' => ['required', 'string', 'max:20'],
        ]);

        $patient = Patient::query()->where('cedula', $data['cedula'])->first();

        if (! $patient) {
            return response()->json([
                'message' => 'Paciente no encontrado para esa cédula.',
            ], 404);
        }

        $name = $patient->full_name ?: 'Paciente';
        $user = $patient->user;

        if (! $user) {
            $user = $this->upsertPatientUser($patient->cedula, $name);
            $patient->update(['user_id' => $user->id]);
            $patient->refresh();
        } else {
            $user->forceFill(['name' => $name])->save();
        }

        return response()->json([
            'token' => $user->createToken('patient-mobile')->plainTextToken,
            'user' => $user->load('patient'),
            'patient' => $patient,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $patient = $user?->patient;

        if (! $patient) {
            return response()->json([
                'message' => 'El usuario autenticado no tiene paciente vinculado.',
            ], 404);
        }

        return response()->json($patient);
    }

    public function completeProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $patient = $user?->patient;

        abort_unless($patient, 404, 'El usuario autenticado no tiene paciente vinculado.');

        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:25'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'blood_type' => ['required', 'string', 'max:10'],
            'allergies' => ['nullable', 'array'],
            'allergies.*' => ['string', 'max:255'],
            'chronic_conditions' => ['nullable', 'array'],
            'chronic_conditions.*' => ['string', 'max:255'],
            'has_disability' => ['required', 'boolean'],
            'disability_type' => ['nullable', 'required_if:has_disability,true', 'string', 'max:255'],
            'disability_percentage' => ['nullable', 'required_if:has_disability,true', 'integer', 'min:1', 'max:100'],
        ]);

        if (empty($data['has_disability'])) {
            $data['disability_type'] = null;
            $data['disability_percentage'] = null;
        }

        $data['profile_completed_at'] = now();

        $patient->update($data);

        $user->forceFill(['name' => $data['full_name']])->save();

        return response()->json($patient->refresh());
    }

    public function show(Patient $patient): JsonResponse
    {
        $this->authorizePatientAccess(request()->user(), $patient);

        return response()->json($patient->load(['appointments', 'medicalRecords', 'documents']));
    }

    public function update(Request $request, Patient $patient): JsonResponse
    {
        $this->authorizePatientAccess($request->user(), $patient);

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
            'chronic_conditions' => ['nullable', 'array'],
            'has_disability' => ['nullable', 'boolean'],
            'disability_type' => ['nullable', 'string', 'max:255'],
            'disability_percentage' => ['nullable', 'integer', 'min:1', 'max:100'],
            'insurance_name' => ['nullable', 'string', 'max:255'],
        ]);

        $patient->update($data);

        if (array_key_exists('cedula', $data) || array_key_exists('full_name', $data)) {
            $user = $this->upsertPatientUser($patient->cedula, $patient->full_name);
            $patient->update(['user_id' => $user->id]);
        }

        return response()->json($patient->refresh());
    }

    public function search(Request $request): JsonResponse
    {
        abort_unless(
            in_array($request->user()?->role, [UserRole::Admin->value, UserRole::Receptionist->value, UserRole::Doctor->value], true),
            403,
            'No tienes permisos para buscar pacientes.'
        );

        $query = (string) $request->query('query', '');

        $patients = Patient::query()
            ->where('cedula', 'like', "%{$query}%")
            ->orWhere('full_name', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->limit(10)
            ->get();

        return response()->json($patients);
    }

    private function upsertPatient(string $cedula, string $fullName, int $userId): Patient
    {
        return Patient::updateOrCreate(
            ['cedula' => $cedula],
            [
                'full_name' => $fullName,
                'user_id' => $userId,
            ]
        );
    }

    private function upsertPatientUser(string $cedula, string $fullName): User
    {
        $email = sprintf('%s@patients.medflow.local', $cedula);

        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $fullName,
                'password' => Hash::make(Str::password(24)),
                'role' => UserRole::Patient->value,
            ]
        );
    }

    private function authorizePatientAccess(?User $user, Patient $patient): void
    {
        abort_unless($user, 401, 'No autenticado.');

        if ($user->role === UserRole::Patient->value) {
            abort_unless($user->patient?->is($patient), 403, 'No puedes acceder a otro paciente.');
            return;
        }

        abort_unless(
            in_array($user->role, [UserRole::Admin->value, UserRole::Receptionist->value, UserRole::Doctor->value], true),
            403,
            'No tienes permisos para acceder a este paciente.'
        );
    }
}
