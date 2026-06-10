<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\DoctorAvailabilitySlot;
use App\Models\QrToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Appointment::with(['patient', 'availabilitySlot', 'doctor'])->latest('scheduled_at');

        if ($user?->role === UserRole::Patient->value && $user->patient) {
            $query->where('patient_id', $user->patient->id);
        }

        if ($user?->role === UserRole::Doctor->value) {
            $query->where('doctor_id', $user->id);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['nullable', 'exists:users,id'],
            'availability_slot_id' => ['nullable', 'exists:doctor_availability_slots,id'],
            'specialty' => ['required', 'string', 'max:255'],
            'scheduled_at' => ['required_without:availability_slot_id', 'date'],
            'reason' => ['required', 'string'],
            'observations' => ['nullable', 'string'],
            'status' => ['nullable', 'in:pending,confirmed,waiting,in_consultation,completed,cancelled,no_show'],
        ]);

        $user = $request->user();

        if ($user?->role === UserRole::Patient->value) {
            abort_unless($user->patient, 403, 'Paciente autenticado sin perfil vinculado.');
            $data['patient_id'] = $user->patient->id;
            $data['status'] = $data['status'] ?? AppointmentStatus::Confirmed->value;
        }

        $appointment = $this->createAppointmentFromData($data);

        return response()->json($appointment->load(['patient', 'availabilitySlot', 'doctor']), 201);
    }

    public function publicStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'availability_slot_id' => ['required', 'exists:doctor_availability_slots,id'],
            'specialty' => ['required', 'string', 'max:255'],
            'reason' => ['required', 'string'],
        ]);

        $appointment = $this->createAppointmentFromData([
            ...$data,
            'status' => AppointmentStatus::Pending->value,
        ]);

        return response()->json($appointment->load(['patient', 'availabilitySlot', 'doctor']), 201);
    }

    private function createAppointmentFromData(array $data): Appointment
    {
        return DB::transaction(function () use ($data) {
            $slot = null;

            if (! empty($data['availability_slot_id'])) {
                $slot = DoctorAvailabilitySlot::query()
                    ->whereKey($data['availability_slot_id'])
                    ->where('status', 'available')
                    ->lockForUpdate()
                    ->firstOrFail();

                $data['doctor_id'] = $slot->doctor_id;
                $data['scheduled_at'] = $slot->starts_at;
            }

            $appointment = Appointment::create([
                ...$data,
                'status' => $data['status'] ?? AppointmentStatus::Pending->value,
            ]);

            if ($slot) {
                $slot->update([
                    'appointment_id' => $appointment->id,
                    'status' => 'booked',
                ]);
            }

            return $appointment;
        });
    }

    public function show(Appointment $appointment): JsonResponse
    {
        $this->authorizeAppointmentAccess(request()->user(), $appointment);

        return response()->json($appointment->load(['patient', 'medicalRecord', 'qrToken', 'availabilitySlot', 'doctor']));
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $this->authorizeAppointmentManagement($request->user(), $appointment);

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
        $this->authorizeAppointmentManagement($request->user(), $appointment);

        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,waiting,in_consultation,completed,cancelled,no_show'],
        ]);

        $appointment->update($data);

        if ($appointment->availabilitySlot) {
            $slotStatus = match ($data['status']) {
                AppointmentStatus::Completed->value => 'completed',
                AppointmentStatus::Cancelled->value, AppointmentStatus::NoShow->value => 'cancelled',
                default => 'booked',
            };

            $appointment->availabilitySlot->update(['status' => $slotStatus]);
        }

        return response()->json($appointment->refresh());
    }

    public function generateQr(Appointment $appointment): JsonResponse
    {
        $this->authorizeAppointmentAccess(request()->user(), $appointment);

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
        $this->authorizeQrScan($request->user());

        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $qrToken = QrToken::where('token', $data['token'])->firstOrFail();
        $qrToken->update(['scanned_at' => now()]);
        $qrToken->appointment()->update(['status' => AppointmentStatus::Waiting->value]);

        return response()->json($qrToken->load('appointment'));
    }

    private function authorizeAppointmentAccess(?\App\Models\User $user, Appointment $appointment): void
    {
        abort_unless($user, 401, 'No autenticado.');

        if ($user->role === UserRole::Patient->value) {
            abort_unless($user->patient && $appointment->patient_id === $user->patient->id, 403, 'No puedes ver citas de otro paciente.');
            return;
        }

        if ($user->role === UserRole::Doctor->value) {
            abort_unless($appointment->doctor_id === $user->id, 403, 'No puedes ver citas de otro medico.');
            return;
        }

        abort_unless(
            in_array($user->role, [UserRole::Admin->value, UserRole::Receptionist->value], true),
            403,
            'No tienes permisos para acceder a esta cita.'
        );
    }

    private function authorizeAppointmentManagement(?\App\Models\User $user, Appointment $appointment): void
    {
        abort_unless($user, 401, 'No autenticado.');

        if ($user->role === UserRole::Doctor->value) {
            abort_unless($appointment->doctor_id === $user->id, 403, 'No puedes modificar citas de otro medico.');
            return;
        }

        abort_unless(
            in_array($user->role, [UserRole::Admin->value, UserRole::Receptionist->value], true),
            403,
            'No tienes permisos para modificar esta cita.'
        );
    }

    private function authorizeQrScan(?\App\Models\User $user): void
    {
        abort_unless($user, 401, 'No autenticado.');
        abort_unless(
            in_array($user->role, [UserRole::Admin->value, UserRole::Receptionist->value, UserRole::Doctor->value], true),
            403,
            'No tienes permisos para escanear codigos QR.'
        );
    }
}
