<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffOnlyEndpointsTest extends TestCase
{
    use RefreshDatabase;

    private function patientUser(): User
    {
        $user = User::create([
            'name' => 'Ana Perez',
            'email' => '1312345678@patients.medflow.local',
            'password' => 'temporary-password',
            'role' => 'patient',
        ]);

        Patient::create([
            'user_id' => $user->id,
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        return $user;
    }

    private function doctorUser(): User
    {
        return User::create([
            'name' => 'Dr. Ruiz',
            'email' => 'doctor@example.com',
            'password' => 'temporary-password',
            'role' => 'doctor',
        ]);
    }

    public function test_patient_cannot_create_medical_record(): void
    {
        $patientUser = $this->patientUser();
        $doctor = $this->doctorUser();
        $patient = $patientUser->patient;

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay(),
            'reason' => 'Control',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($patientUser);

        $this->postJson('/api/medical-records', [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'doctor_id' => $patientUser->id,
            'consultation_reason' => 'Autodiagnostico',
            'diagnosis' => 'Falso',
        ])->assertForbidden();

        $this->assertDatabaseCount('medical_records', 0);
    }

    public function test_doctor_creates_medical_record_forced_to_own_id(): void
    {
        $doctor = $this->doctorUser();
        $otherDoctor = User::create([
            'name' => 'Dra. Vega',
            'email' => 'doctor2@example.com',
            'password' => 'temporary-password',
            'role' => 'doctor',
        ]);
        $patient = Patient::create([
            'full_name' => 'Luis Torres',
            'cedula' => '0999999999',
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay(),
            'reason' => 'Control',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($doctor);

        // El doctor intenta atribuir el historial a otro medico; el servidor lo fuerza a su propio id.
        $this->postJson('/api/medical-records', [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'doctor_id' => $otherDoctor->id,
            'consultation_reason' => 'Dolor toracico',
            'diagnosis' => 'Arritmia',
        ])
            ->assertCreated()
            ->assertJsonPath('doctor_id', $doctor->id);

        $appointment->refresh();
        $this->assertSame('completed', $appointment->status);
    }

    public function test_patient_cannot_create_patient_record(): void
    {
        Sanctum::actingAs($this->patientUser());

        $this->postJson('/api/patients', [
            'full_name' => 'Paciente Fantasma',
            'cedula' => '0123456789',
        ])->assertForbidden();
    }

    public function test_patient_cannot_list_users(): void
    {
        Sanctum::actingAs($this->patientUser());

        $this->getJson('/api/users')->assertForbidden();
    }

    public function test_staff_can_list_users(): void
    {
        Sanctum::actingAs($this->doctorUser());

        $this->getJson('/api/users')->assertOk();
    }

    public function test_patient_cannot_upload_document(): void
    {
        $patientUser = $this->patientUser();

        Sanctum::actingAs($patientUser);

        $this->postJson('/api/documents', [
            'patient_id' => $patientUser->patient->id,
            'title' => 'Documento falso',
            'document_type' => 'lab',
        ])->assertForbidden();

        $this->assertDatabaseCount('medical_documents', 0);
    }

    public function test_document_upload_sets_uploaded_by_to_authenticated_staff(): void
    {
        $doctor = $this->doctorUser();
        $patient = Patient::create([
            'full_name' => 'Luis Torres',
            'cedula' => '0999999999',
        ]);

        Sanctum::actingAs($doctor);

        $this->postJson('/api/documents', [
            'patient_id' => $patient->id,
            'title' => 'Examen de sangre',
            'document_type' => 'lab',
        ])
            ->assertCreated()
            ->assertJsonPath('uploaded_by', $doctor->id);
    }
}
