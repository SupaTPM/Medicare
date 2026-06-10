<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function notifyUser(
        User $user,
        string $type,
        string $title,
        string $body,
        ?Appointment $appointment = null,
        array $data = [],
        bool $dedupe = true,
    ): AppNotification {
        $attributes = [
            'user_id' => $user->id,
            'appointment_id' => $appointment?->id,
            'type' => $type,
        ];

        $values = [
            'title' => $title,
            'body' => $body,
            'data' => [
                ...$data,
                'appointment_id' => $appointment?->id,
            ],
        ];

        $notification = $dedupe
            ? AppNotification::firstOrCreate($attributes, $values)
            : AppNotification::create([...$attributes, ...$values]);

        if (! $notification->wasRecentlyCreated && $dedupe) {
            return $notification;
        }

        $this->sendPush($notification, $user);

        return $notification->refresh();
    }

    public function notifyAppointmentCreated(Appointment $appointment): void
    {
        $appointment->loadMissing(['patient.user', 'doctor']);

        if ($appointment->patient?->user) {
            $this->notifyUser(
                $appointment->patient->user,
                'appointment_created',
                'Cita agendada',
                'Tu cita fue registrada correctamente. Revisa los detalles en la app.',
                $appointment
            );
        }

        if ($appointment->doctor) {
            $this->notifyUser(
                $appointment->doctor,
                'appointment_assigned',
                'Nueva cita asignada',
                'Tienes una nueva cita en tu agenda.',
                $appointment
            );
        }
    }

    public function notifyAppointmentStatusChanged(Appointment $appointment, string $previousStatus): void
    {
        $appointment->loadMissing(['patient.user', 'doctor']);
        $patientUser = $appointment->patient?->user;

        if ($patientUser) {
            $this->notifyUser(
                $patientUser,
                "appointment_status_{$appointment->status}",
                $appointment->status === 'cancelled' ? 'Cita cancelada' : 'Estado de cita actualizado',
                $appointment->status === 'cancelled'
                    ? 'Tu cita fue cancelada. Revisa la app para más detalles.'
                    : 'El estado de tu cita fue actualizado.',
                $appointment,
                ['previous_status' => $previousStatus],
                false
            );
        }

        if ($appointment->status === 'cancelled' && $appointment->doctor) {
            $this->notifyUser(
                $appointment->doctor,
                'appointment_cancelled_doctor',
                'Cita cancelada',
                'Una cita fue cancelada en tu agenda.',
                $appointment,
                ['previous_status' => $previousStatus],
                false
            );
        }
    }

    public function notifyAppointmentReminder(Appointment $appointment, string $type, string $body): void
    {
        $appointment->loadMissing(['patient.user']);

        if (! $appointment->patient?->user) {
            return;
        }

        $this->notifyUser(
            $appointment->patient->user,
            $type,
            'Recordatorio de cita',
            $body,
            $appointment
        );
    }

    private function sendPush(AppNotification $notification, User $user): void
    {
        $tokens = $user->deviceTokens()
            ->whereNotNull('token')
            ->pluck('token')
            ->filter(fn (string $token): bool => str_starts_with($token, 'ExponentPushToken[') || str_starts_with($token, 'ExpoPushToken['))
            ->values();

        if ($tokens->isEmpty()) {
            return;
        }

        try {
            $response = Http::timeout(6)->post('https://exp.host/--/api/v2/push/send', $tokens->map(fn (string $token): array => [
                'to' => $token,
                'title' => $notification->title,
                'body' => $notification->body,
                'data' => $notification->data ?? [],
                'sound' => 'default',
            ])->all());

            if ($response->successful()) {
                $notification->update(['sent_at' => now(), 'push_error' => null]);
                return;
            }

            $notification->update(['push_error' => $response->body()]);
        } catch (\Throwable $exception) {
            Log::warning('Expo push notification failed', [
                'notification_id' => $notification->id,
                'error' => $exception->getMessage(),
            ]);

            $notification->update(['push_error' => $exception->getMessage()]);
        }
    }
}
