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
