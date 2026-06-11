<?php

namespace App\Http\Controllers;

use App\Models\DoctorAvailabilitySlot;
use App\Models\DoctorProfile;
use App\Models\User;
use App\Http\Resources\DoctorProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduleController extends Controller
{
    public function specialties(): JsonResponse
    {
        return response()->json(
            DoctorProfile::query()
                ->select('specialty')
                ->distinct()
                ->orderBy('specialty')
                ->pluck('specialty')
        );
    }

    public function doctors(Request $request): JsonResponse
    {
        $specialty = (string) $request->query('specialty', '');

        $doctors = User::query()
            ->where('role', 'doctor')
            ->whereHas('doctorProfile', function ($query) use ($specialty) {
                if ($specialty !== '') {
                    $query->where('specialty', $specialty);
                }
            })
            ->with(['doctorProfile', 'nextAvailableSlot'])
            ->withAvg('reviewsReceived as rating', 'rating')
            ->withCount('reviewsReceived as reviews_count')
            ->orderBy('name')
            ->get();

        return response()->json(DoctorProfileResource::collection($doctors)->resolve());
    }

    public function availability(User $doctor): JsonResponse
    {
        abort_unless($doctor->role === 'doctor', 404);

        return response()->json(
            DoctorAvailabilitySlot::query()
                ->where('doctor_id', $doctor->id)
                ->where('status', 'available')
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->limit(30)
                ->get()
        );
    }
}
