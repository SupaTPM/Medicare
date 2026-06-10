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
        $doctor = User::updateOrCreate(['email' => 'doctor@medflow.test'], [
            'name' => 'Dr. Alejandro Solis',
            'password' => 'password123',
            'role' => 'doctor',
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
    }
}
