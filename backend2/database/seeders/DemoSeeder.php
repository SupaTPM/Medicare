<?php

namespace Database\Seeders;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $doctor = User::create([
            'name' => 'Dr. Alejandro Solis',
            'email' => 'doctor@medflow.test',
            'password' => 'password123',
            'role' => 'doctor',
        ]);

        $reception = User::create([
            'name' => 'Camila Vera',
            'email' => 'recepcion@medflow.test',
            'password' => 'password123',
            'role' => 'receptionist',
        ]);

        $patient = Patient::create([
            'full_name' => 'Maria Fernanda Lopez',
            'cedula' => '0911122233',
            'blood_type' => 'A+',
            'phone' => '0981112233',
            'allergies' => ['Penicilina'],
        ]);

        Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialty' => 'Cardiologia',
            'scheduled_at' => now()->addDay(),
            'reason' => 'Control cardiologico',
            'status' => AppointmentStatus::Confirmed->value,
        ]);
    }
}
