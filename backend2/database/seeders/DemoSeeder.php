<?php

namespace Database\Seeders;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\DoctorAvailabilitySlot;
use App\Models\Patient;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $doctor = User::updateOrCreate(['email' => 'doctor@medflow.test'], [
            'name' => 'Dr. Alejandro Solis',
            'password' => 'password123',
            'role' => 'doctor',
        ]);

        $doctor->doctorProfile()->updateOrCreate([], [
            'cedula' => '0911111111',
            'specialty' => 'Cardiologia',
            'license_code' => 'MED-001',
            'phone' => '0990000001',
            'bio' => 'Cardiologo clinico enfocado en prevencion, control de hipertension y seguimiento de pacientes con riesgo cardiovascular.',
            'education' => 'Universidad Central del Ecuador · Cardiologia clinica',
            'experience_years' => 12,
            'languages' => ['Español', 'Ingles'],
            'location' => 'Hospital Central, Consultorio 204',
            'consultation_price' => 35.00,
        ]);

        $generalDoctor = User::updateOrCreate(['email' => 'luis@medflow.test'], [
            'name' => 'Dr. Luis Mendoza',
            'password' => 'password123',
            'role' => 'doctor',
        ]);

        $generalDoctor->doctorProfile()->updateOrCreate([], [
            'cedula' => '0922222222',
            'specialty' => 'Medicina general',
            'license_code' => 'MED-002',
            'phone' => '0990000002',
            'bio' => 'Medico general con enfoque familiar, medicina preventiva y continuidad del cuidado para pacientes adultos.',
            'education' => 'Universidad de Guayaquil · Medicina familiar',
            'experience_years' => 8,
            'languages' => ['Español'],
            'location' => 'Clinica Norte, Consultorio 105',
            'consultation_price' => 25.00,
        ]);

        $pediatrician = User::updateOrCreate(['email' => 'elena@medflow.test'], [
            'name' => 'Dra. Elena Mera',
            'password' => 'password123',
            'role' => 'doctor',
        ]);

        $pediatrician->doctorProfile()->updateOrCreate([], [
            'cedula' => '0933333333',
            'specialty' => 'Pediatria',
            'license_code' => 'MED-003',
            'phone' => '0990000003',
            'bio' => 'Pediatra orientada al crecimiento saludable, vacunas, controles infantiles y acompañamiento a familias.',
            'education' => 'Pontificia Universidad Catolica del Ecuador · Pediatria',
            'experience_years' => 10,
            'languages' => ['Español', 'Ingles'],
            'location' => 'Hospital Infantil, Consultorio 302',
            'consultation_price' => 30.00,
        ]);

        User::updateOrCreate(['email' => 'recepcion@medflow.test'], [
            'name' => 'Camila Vera',
            'password' => 'password123',
            'role' => 'receptionist',
        ]);

        User::updateOrCreate(['email' => 'admin@medflow.test'], [
            'name' => 'Ana Torres',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $patient = Patient::updateOrCreate(['cedula' => '0911122233'], [
            'full_name' => 'Maria Fernanda Lopez',
            'blood_type' => 'A+',
            'phone' => '0981112233',
            'allergies' => ['Penicilina'],
            'insurance_provider' => 'OSDE 210',
            'insurance_number' => 'OS-1234567',
        ]);

        Appointment::updateOrCreate([
            'patient_id' => $patient->id,
            'reason' => 'Control cardiologico',
        ], [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay()->startOfMinute(),
            'reason' => 'Control cardiologico',
            'status' => AppointmentStatus::Confirmed->value,
        ]);

        $completedAppointment = Appointment::updateOrCreate([
            'patient_id' => $patient->id,
            'reason' => 'Chequeo general previo',
        ], [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->subWeek(),
            'reason' => 'Chequeo general previo',
            'status' => AppointmentStatus::Completed->value,
        ]);

        Review::updateOrCreate([
            'appointment_id' => $completedAppointment->id,
        ], [
            'doctor_id' => $doctor->id,
            'patient_id' => $patient->id,
            'rating' => 5,
            'comment' => 'Excelente atencion, muy profesional y puntual.',
        ]);

        Review::updateOrCreate([
            'doctor_id' => $generalDoctor->id,
            'patient_id' => $patient->id,
            'appointment_id' => null,
        ], [
            'doctor_id' => $generalDoctor->id,
            'patient_id' => $patient->id,
            'appointment_id' => null,
            'rating' => 4,
            'comment' => 'Buen trato y explicaciones claras.',
        ]);

        Review::updateOrCreate([
            'doctor_id' => $pediatrician->id,
            'patient_id' => $patient->id,
            'appointment_id' => null,
        ], [
            'doctor_id' => $pediatrician->id,
            'patient_id' => $patient->id,
            'appointment_id' => null,
            'rating' => 5,
            'comment' => 'Muy paciente y cariñosa con los niños.',
        ]);

        collect([$doctor, $generalDoctor, $pediatrician])->each(function (User $doctorUser, int $doctorIndex): void {
            foreach ([9, 10, 11, 15, 16] as $hourIndex => $hour) {
                $startsAt = now()
                    ->addDays($doctorIndex + 1)
                    ->setTime($hour, $hourIndex % 2 === 0 ? 0 : 30)
                    ->startOfMinute();

                DoctorAvailabilitySlot::updateOrCreate([
                    'doctor_id' => $doctorUser->id,
                    'starts_at' => $startsAt,
                ], [
                    'ends_at' => $startsAt->copy()->addMinutes(30),
                    'status' => 'available',
                ]);
            }
        });
    }
}
