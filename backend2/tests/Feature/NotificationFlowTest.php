<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\Appointment;
use App\Models\DeviceToken;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_register_device_token(): void
    {
        $user = User::create([
            'name' => 'Ana Perez',
            'email' => 'ana@example.com',
            'password' => 'temporary-password',
            'role' => 'patient',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/device-tokens', [
            'token' => 'ExponentPushToken[test-token]',
            'platform' => 'ios',
        ])
            ->assertCreated()
            ->assertJsonPath('user_id', $user->id);

        $this->assertDatabaseHas('device_tokens', [
            'user_id' => $user->id,
            'token' => 'ExponentPushToken[test-token]',
            'platform' => 'ios',
        ]);
    }

    public function test_appointment_creation_stores_patient_notification(): void
    {
        Http::fake();

        $doctor = User::create([
            'name' => 'Dr. Ruiz',
            'email' => 'doctor@example.com',
            'password' => 'temporary-password',
            'role' => 'doctor',
        ]);

        $patientUser = User::create([
            'name' => 'Ana Perez',
            'email' => 'ana@example.com',
            'password' => 'temporary-password',
            'role' => 'patient',
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        DeviceToken::create([
            'user_id' => $patientUser->id,
            'token' => 'ExponentPushToken[test-token]',
            'last_seen_at' => now(),
        ]);

        Sanctum::actingAs($patientUser);

        $this->postJson('/api/appointments', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay()->toIso8601String(),
            'reason' => 'Control anual',
            'status' => 'confirmed',
        ])->assertCreated();

        $this->assertDatabaseHas('app_notifications', [
            'user_id' => $patientUser->id,
            'type' => 'appointment_created',
            'title' => 'Cita agendada',
        ]);

        Http::assertSentCount(1);
    }

    public function test_reminder_command_creates_one_24h_reminder_per_appointment(): void
    {
        $patientUser = User::create([
            'name' => 'Ana Perez',
            'email' => 'ana@example.com',
            'password' => 'temporary-password',
            'role' => 'patient',
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addHours(24),
            'reason' => 'Control',
            'status' => 'confirmed',
        ]);

        Artisan::call('appointments:send-reminders');
        Artisan::call('appointments:send-reminders');

        $this->assertSame(
            1,
            AppNotification::query()
                ->where('appointment_id', $appointment->id)
                ->where('type', 'appointment_reminder_24h')
                ->count()
        );
    }
}
