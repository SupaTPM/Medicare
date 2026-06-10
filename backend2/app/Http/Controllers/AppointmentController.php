<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\QrToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Appointment::with('patient')->latest('scheduled_at')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['nullable', 'exists:users,id'],
            'specialty' => ['required', 'string', 'max:255'],
            'scheduled_at' => ['required', 'date'],
            'reason' => ['required', 'string'],
            'observations' => ['nullable', 'string'],
            'status' => ['nullable', 'in:pending,confirmed,waiting,in_consultation,completed,cancelled,no_show'],
        ]);

        $appointment = Appointment::create([
            ...$data,
            'status' => $data['status'] ?? AppointmentStatus::Pending->value,
        ]);

        return response()->json($appointment, 201);
    }

    public function show(Appointment $appointment): JsonResponse
    {
        return response()->json($appointment->load(['patient', 'medicalRecord', 'qrToken']));
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate([
            'doctor_id' => ['nullable', 'exists:users,id'],
            'specialty' => ['sometimes', 'string', 'max:255'],
            'scheduled_at' => ['sometimes', 'date'],
            'reason' => ['sometimes', 'string'],
            'observations' => ['nullable', 'string'],
        ]);

        $appointment->update($data);

        return response()->json($appointment->refresh());
    }

    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,waiting,in_consultation,completed,cancelled,no_show'],
        ]);

        $appointment->update($data);

        return response()->json($appointment->refresh());
    }

    public function generateQr(Appointment $appointment): JsonResponse
    {
        $token = $appointment->qrToken()->updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'token' => 'APT-' . now()->format('Y') . '-' . Str::upper(Str::random(8)),
                'expires_at' => now()->addDay(),
            ]
        );

        return response()->json($token);
    }

    public function scanQr(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $qrToken = QrToken::where('token', $data['token'])->firstOrFail();
        $qrToken->update(['scanned_at' => now()]);
        $qrToken->appointment()->update(['status' => AppointmentStatus::Waiting->value]);

        return response()->json($qrToken->load('appointment'));
    }
}
