<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\DoctorAvailabilitySlot;
use App\Models\DoctorProfile;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PatientCedulaAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_device_registration_creates_patient_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/patients/device-registration', [
            'cedula' => '1312345678',
            'full_name' => 'Ana Perez',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.role', 'patient')
            ->assertJsonPath('user.email', '1312345678@patients.medflow.local')
            ->assertJsonPath('patient.cedula', '1312345678');

        $patient = Patient::firstOrFail();
        $user = User::firstOrFail();

        $this->assertSame($user->id, $patient->user_id);
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_cedula_login_reuses_existing_patient_user(): void
    {
        $user = User::create([
            'name' => 'Ana Perez',
            'email' => '1312345678@patients.medflow.local',
            'password' => 'temporary-password',
            'role' => 'patient',
        ]);

        $patient = Patient::create([
            'user_id' => $user->id,
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        $response = $this->postJson('/api/patients/cedula-login', [
            'cedula' => '1312345678',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('patient.id', $patient->id);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('patients', 1);
        $this->assertNotEmpty($response->json('token'));
    }

    public function test_patient_can_book_slot_once_with_authenticated_session(): void
    {
        $doctor = User::create([
            'name' => 'Dr. Ruiz',
            'email' => 'doctor@example.com',
            'password' => 'temporary-password',
            'role' => 'doctor',
        ]);

        DoctorProfile::create([
            'user_id' => $doctor->id,
            'specialty' => 'Cardiologia',
        ]);

        $slot = DoctorAvailabilitySlot::create([
            'doctor_id' => $doctor->id,
            'starts_at' => now()->addDay()->setHour(9)->setMinute(0),
            'ends_at' => now()->addDay()->setHour(9)->setMinute(30),
            'status' => 'available',
        ]);

        $authResponse = $this->postJson('/api/patients/device-registration', [
            'cedula' => '1312345678',
            'full_name' => 'Ana Perez',
        ]);

        $token = $authResponse->json('token');
        $patientId = $authResponse->json('patient.id');

        $firstBooking = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/appointments', [
                'patient_id' => 999999,
                'availability_slot_id' => $slot->id,
                'specialty' => 'Cardiologia',
                'reason' => 'Control anual',
            ]);

        $firstBooking
            ->assertCreated()
            ->assertJsonPath('patient_id', $patientId)
            ->assertJsonPath('availability_slot_id', $slot->id);

        $slot->refresh();
        $this->assertSame('booked', $slot->status);

        $secondBooking = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/appointments', [
                'patient_id' => $patientId,
                'availability_slot_id' => $slot->id,
                'specialty' => 'Cardiologia',
                'reason' => 'Segundo intento',
            ]);

        $secondBooking->assertNotFound();
    }

    public function test_patient_cannot_open_another_patient_profile_or_search_directory(): void
    {
        $user = User::create([
            'name' => 'Ana Perez',
            'email' => '1312345678@patients.medflow.local',
            'password' => 'temporary-password',
            'role' => 'patient',
        ]);

        $ownPatient = Patient::create([
            'user_id' => $user->id,
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        $otherPatient = Patient::create([
            'full_name' => 'Luis Torres',
            'cedula' => '0999999999',
        ]);

        Sanctum::actingAs($user);

        $this->getJson("/api/patients/{$otherPatient->id}")
            ->assertForbidden();

        $this->getJson('/api/patients/search?query=Luis')
            ->assertForbidden();

        $this->getJson("/api/patients/{$ownPatient->id}")
            ->assertOk()
            ->assertJsonPath('id', $ownPatient->id);
    }

    public function test_patient_cannot_view_or_modify_other_patient_appointment(): void
    {
        $doctor = User::create([
            'name' => 'Dr. Ruiz',
            'email' => 'doctor@example.com',
            'password' => 'temporary-password',
            'role' => 'doctor',
        ]);

        $patientUser = User::create([
            'name' => 'Ana Perez',
            'email' => '1312345678@patients.medflow.local',
            'password' => 'temporary-password',
            'role' => 'patient',
        ]);

        $ownPatient = Patient::create([
            'user_id' => $patientUser->id,
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        $otherPatient = Patient::create([
            'full_name' => 'Luis Torres',
            'cedula' => '0999999999',
        ]);

        $appointment = Appointment::create([
            'patient_id' => $otherPatient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay(),
            'reason' => 'Control',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($patientUser);

        $this->getJson("/api/appointments/{$appointment->id}")
            ->assertForbidden();

        $this->putJson("/api/appointments/{$appointment->id}", [
            'reason' => 'Cambio de motivo',
        ])->assertForbidden();

        $this->postJson("/api/appointments/{$appointment->id}/generate-qr")
            ->assertForbidden();
    }

    public function test_doctor_can_only_manage_own_appointments(): void
    {
        $doctor = User::create([
            'name' => 'Dr. Ruiz',
            'email' => 'doctor@example.com',
            'password' => 'temporary-password',
            'role' => 'doctor',
        ]);

        $otherDoctor = User::create([
            'name' => 'Dra. Vega',
            'email' => 'doctor2@example.com',
            'password' => 'temporary-password',
            'role' => 'doctor',
        ]);

        $patient = Patient::create([
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $otherDoctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay(),
            'reason' => 'Control',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($doctor);

        $this->getJson("/api/appointments/{$appointment->id}")
            ->assertForbidden();

        $this->putJson("/api/appointments/{$appointment->id}/status", [
            'status' => 'completed',
        ])->assertForbidden();
    }
}
