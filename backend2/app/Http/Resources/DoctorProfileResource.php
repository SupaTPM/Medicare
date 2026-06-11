<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->doctorProfile;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'profile_completed' => $profile ? $this->isProfileComplete($profile) : false,
            'rating' => $this->rating !== null ? round((float) $this->rating, 1) : null,
            'reviews_count' => (int) ($this->reviews_count ?? 0),
            'next_slot' => $this->relationLoaded('nextAvailableSlot') && $this->nextAvailableSlot
                ? [
                    'starts_at' => $this->nextAvailableSlot->starts_at?->toIso8601String(),
                    'label' => $this->nextAvailableSlot->starts_at?->translatedFormat('D, j M H:i'),
                ]
                : null,
            'doctor_profile' => $profile ? [
                'cedula' => $profile->cedula,
                'specialty' => $profile->specialty,
                'license_code' => $profile->license_code,
                'phone' => $profile->phone,
                'profile_photo_url' => $profile->profile_photo_url,
                'bio' => $profile->bio,
                'education' => $profile->education,
                'experience_years' => $profile->experience_years,
                'languages' => $profile->languages ?? [],
                'location' => $profile->location,
                'consultation_price' => $profile->consultation_price !== null ? (float) $profile->consultation_price : null,
            ] : null,
        ];
    }

    private function isProfileComplete(mixed $profile): bool
    {
        return filled($profile->specialty)
            && filled($profile->cedula)
            && filled($profile->license_code)
            && filled($profile->phone)
            && filled($profile->profile_photo_path)
            && filled($profile->bio)
            && filled($profile->education)
            && $profile->experience_years !== null
            && ! empty($profile->languages);
    }
}
