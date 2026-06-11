<?php

namespace App\Http\Controllers;

use App\Http\Resources\DoctorProfileResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DoctorProfileController extends Controller
{
    public function show(User $doctor): JsonResponse
    {
        abort_unless($doctor->role === 'doctor', 404);

        $doctor->load('doctorProfile')
            ->loadAvg('reviewsReceived as rating', 'rating')
            ->loadCount('reviewsReceived as reviews_count');

        return response()->json((new DoctorProfileResource($doctor))->resolve());
    }

    public function update(Request $request, User $doctor): JsonResponse
    {
        $this->authorizeProfileUpdate($request->user(), $doctor);

        $isDoctorSelfOnboarding = $request->user()?->id === $doctor->id && $request->user()?->role === 'doctor';

        $data = $request->validate([
            'cedula' => [$isDoctorSelfOnboarding ? 'required' : 'nullable', 'string', 'max:20', 'unique:doctor_profiles,cedula,' . ($doctor->doctorProfile?->id ?? 'NULL')],
            'specialty' => [$isDoctorSelfOnboarding ? 'required' : 'sometimes', 'string', 'max:255'],
            'license_code' => [$isDoctorSelfOnboarding ? 'required' : 'nullable', 'string', 'max:255'],
            'phone' => [$isDoctorSelfOnboarding ? 'required' : 'nullable', 'string', 'max:25'],
            'bio' => [$isDoctorSelfOnboarding ? 'required' : 'nullable', 'string', 'max:1200'],
            'education' => [$isDoctorSelfOnboarding ? 'required' : 'nullable', 'string', 'max:255'],
            'experience_years' => [$isDoctorSelfOnboarding ? 'required' : 'nullable', 'integer', 'min:0', 'max:80'],
            'languages' => [$isDoctorSelfOnboarding ? 'required' : 'nullable', 'array', 'min:1'],
            'languages.*' => ['string', 'max:40'],
            'location' => ['nullable', 'string', 'max:255'],
            'consultation_price' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'profile_photo' => [
                $isDoctorSelfOnboarding && ! $doctor->doctorProfile?->profile_photo_path ? 'required' : 'nullable',
                'image',
                'max:2048',
            ],
        ]);

        if ($request->hasFile('profile_photo')) {
            $currentPath = $doctor->doctorProfile?->profile_photo_path;
            $data['profile_photo_path'] = $request->file('profile_photo')->store('doctors', 'public');

            if ($currentPath) {
                Storage::disk('public')->delete($currentPath);
            }
        }

        unset($data['profile_photo']);

        $doctor->doctorProfile()->updateOrCreate([], $data);

        return response()->json((new DoctorProfileResource($doctor->load('doctorProfile')))->resolve());
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user?->role === 'doctor', 403, 'Solo doctores tienen perfil medico.');

        $user->load('doctorProfile')
            ->loadAvg('reviewsReceived as rating', 'rating')
            ->loadCount('reviewsReceived as reviews_count');

        return response()->json((new DoctorProfileResource($user))->resolve());
    }

    private function authorizeProfileUpdate(?User $user, User $doctor): void
    {
        abort_unless($user, 401, 'No autenticado.');
        abort_unless($doctor->role === 'doctor', 404);

        if ($user->role === 'doctor') {
            abort_unless($user->id === $doctor->id, 403, 'No puedes editar el perfil de otro medico.');
            return;
        }

        abort_unless(
            in_array($user->role, ['admin', 'receptionist'], true),
            403,
            'No tienes permisos para editar perfiles medicos.'
        );
    }
}
