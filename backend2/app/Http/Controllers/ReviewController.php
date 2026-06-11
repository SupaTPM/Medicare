<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Appointment $appointment): JsonResponse
    {
        $user = $request->user();

        abort_unless($user, 401, 'No autenticado.');
        abort_unless($user->role === UserRole::Patient->value && $user->patient, 403, 'Solo pacientes pueden dejar resenas.');
        abort_unless($appointment->patient_id === $user->patient->id, 403, 'No puedes resenar la cita de otro paciente.');
        abort_unless($appointment->status === AppointmentStatus::Completed->value, 422, 'Solo puedes resenar citas completadas.');

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $review = Review::updateOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'doctor_id' => $appointment->doctor_id,
                'patient_id' => $appointment->patient_id,
                'rating' => $data['rating'],
                'comment' => $data['comment'] ?? null,
            ]
        );

        return response()->json($review, 201);
    }

    public function indexForDoctor(User $doctor): JsonResponse
    {
        abort_unless($doctor->role === 'doctor', 404);

        $reviews = Review::query()
            ->where('doctor_id', $doctor->id)
            ->with('patient')
            ->latest()
            ->paginate(10)
            ->through(fn (Review $review) => [
                'id' => $review->id,
                'patient_name' => $review->patient?->full_name,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
            ]);

        return response()->json($reviews);
    }
}
