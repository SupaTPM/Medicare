<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\DoctorAvailabilitySlot;
use App\Models\DoctorProfile;
use App\Models\Patient;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private function createDoctor(string $email = 'doctor@example.com'): User
    {
        $doctor = User::create([
            'name' => 'Dr. Ruiz',
            'email' => $email,
            'password' => 'password123',
            'role' => 'doctor',
        ]);

        DoctorProfile::create([
            'user_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'location' => 'Hospital Central, Consultorio 204',
            'consultation_price' => 35.50,
        ]);

        return $doctor;
    }

    private function createPatientUser(): array
    {
        $user = User::create([
            'name' => 'Ana Perez',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'role' => 'patient',
        ]);

        $patient = Patient::create([
            'user_id' => $user->id,
            'full_name' => 'Ana Perez',
            'cedula' => '1312345678',
        ]);

        return [$user, $patient];
    }

    public function test_patient_can_review_completed_appointment(): void
    {
        $doctor = $this->createDoctor();
        [$user, $patient] = $this->createPatientUser();

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->subDay(),
            'reason' => 'Control',
            'status' => 'completed',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/appointments/{$appointment->id}/review", [
            'rating' => 5,
            'comment' => 'Excelente atencion',
        ]);

        $response->assertCreated()
            ->assertJsonPath('rating', 5)
            ->assertJsonPath('comment', 'Excelente atencion')
            ->assertJsonPath('doctor_id', $doctor->id)
            ->assertJsonPath('patient_id', $patient->id)
            ->assertJsonPath('appointment_id', $appointment->id);

        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_resubmitting_review_updates_existing_record(): void
    {
        $doctor = $this->createDoctor();
        [$user, $patient] = $this->createPatientUser();

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->subDay(),
            'reason' => 'Control',
            'status' => 'completed',
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/appointments/{$appointment->id}/review", [
            'rating' => 3,
            'comment' => 'Bien',
        ])->assertCreated();

        $response = $this->postJson("/api/appointments/{$appointment->id}/review", [
            'rating' => 5,
            'comment' => 'Mejor de lo esperado',
        ]);

        $response->assertCreated()
            ->assertJsonPath('rating', 5)
            ->assertJsonPath('comment', 'Mejor de lo esperado');

        $this->assertDatabaseCount('reviews', 1);
    }

    public function test_cannot_review_non_completed_appointment(): void
    {
        $doctor = $this->createDoctor();
        [$user, $patient] = $this->createPatientUser();

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay(),
            'reason' => 'Control',
            'status' => 'confirmed',
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/appointments/{$appointment->id}/review", [
            'rating' => 5,
        ])->assertStatus(422);

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_patient_cannot_review_another_patients_appointment(): void
    {
        $doctor = $this->createDoctor();
        [$user, $patient] = $this->createPatientUser();

        $otherPatient = Patient::create([
            'full_name' => 'Luis Torres',
            'cedula' => '0999999999',
        ]);

        $appointment = Appointment::create([
            'patient_id' => $otherPatient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->subDay(),
            'reason' => 'Control',
            'status' => 'completed',
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/appointments/{$appointment->id}/review", [
            'rating' => 5,
        ])->assertForbidden();
    }

    public function test_validation_rejects_invalid_rating(): void
    {
        $doctor = $this->createDoctor();
        [$user, $patient] = $this->createPatientUser();

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->subDay(),
            'reason' => 'Control',
            'status' => 'completed',
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/appointments/{$appointment->id}/review", [
            'rating' => 6,
        ])->assertStatus(422);

        $this->postJson("/api/appointments/{$appointment->id}/review", [
            'rating' => 0,
        ])->assertStatus(422);
    }

    public function test_public_can_list_doctor_reviews(): void
    {
        $doctor = $this->createDoctor();
        [, $patient] = $this->createPatientUser();

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->subDay(),
            'reason' => 'Control',
            'status' => 'completed',
        ]);

        Review::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'appointment_id' => $appointment->id,
            'rating' => 4,
            'comment' => 'Muy buena atencion',
        ]);

        $response = $this->getJson("/api/schedule/doctors/{$doctor->id}/reviews");

        $response->assertOk()
            ->assertJsonPath('data.0.rating', 4)
            ->assertJsonPath('data.0.comment', 'Muy buena atencion')
            ->assertJsonPath('data.0.patient_name', 'Ana Perez');
    }

    public function test_doctors_listing_includes_rating_reviews_count_and_next_slot(): void
    {
        $doctor = $this->createDoctor();
        [, $patient] = $this->createPatientUser();

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->subDay(),
            'reason' => 'Control',
            'status' => 'completed',
        ]);

        Review::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'appointment_id' => $appointment->id,
            'rating' => 4,
        ]);

        Review::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'rating' => 5,
        ]);

        $slot = DoctorAvailabilitySlot::create([
            'doctor_id' => $doctor->id,
            'starts_at' => now()->addDays(2)->setTime(9, 0),
            'ends_at' => now()->addDays(2)->setTime(9, 30),
            'status' => 'available',
        ]);

        $response = $this->getJson('/api/schedule/doctors');

        $response->assertOk();

        $data = collect($response->json())->firstWhere('id', $doctor->id);

        $this->assertNotNull($data);
        $this->assertEquals(4.5, $data['rating']);
        $this->assertEquals(2, $data['reviews_count']);
        $this->assertEquals('Hospital Central, Consultorio 204', $data['doctor_profile']['location']);
        $this->assertEquals(35.5, $data['doctor_profile']['consultation_price']);
        $this->assertNotNull($data['next_slot']);
        $this->assertSame($slot->starts_at->toIso8601String(), $data['next_slot']['starts_at']);
    }

    public function test_doctor_profile_show_includes_rating_and_reviews_count(): void
    {
        $doctor = $this->createDoctor();
        [, $patient] = $this->createPatientUser();

        Review::create([
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'rating' => 3,
        ]);

        $response = $this->getJson("/api/schedule/doctors/{$doctor->id}/profile");

        $response->assertOk()
            ->assertJsonPath('rating', 3)
            ->assertJsonPath('reviews_count', 1);
    }
}
