<?php

use Illuminate\Support\Facades\Artisan;
use App\Models\Appointment;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Schedule;

Artisan::command('about-medflow', function () {
    $this->info('MedFlow backend is available.');
})->purpose('Show MedFlow backend status');

Artisan::command('appointments:send-reminders', function (NotificationService $notifications): void {
    $windows = [
        'appointment_reminder_24h' => [
            'from' => now()->addHours(23),
            'to' => now()->addHours(25),
            'body' => 'Tienes una cita médica mañana. Revisa los detalles en la app.',
        ],
        'appointment_reminder_2h' => [
            'from' => now()->addMinutes(105),
            'to' => now()->addMinutes(135),
            'body' => 'Tu cita médica será pronto. Revisa los detalles en la app.',
        ],
    ];

    foreach ($windows as $type => $window) {
        Appointment::query()
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereBetween('scheduled_at', [$window['from'], $window['to']])
            ->with(['patient.user'])
            ->get()
            ->each(fn (Appointment $appointment): mixed => $notifications->notifyAppointmentReminder($appointment, $type, $window['body']));
    }

    $this->info('Appointment reminders processed.');
})->purpose('Send 24h and 2h appointment reminders');

Schedule::command('appointments:send-reminders')->everyFifteenMinutes();
