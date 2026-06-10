<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Resources\DoctorProfileResource;
use App\Models\DoctorProfile;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
            'role' => ['required', 'in:patient,doctor,receptionist,admin'],
        ]);

        $user = User::create($data);

        return response()->json([
            'token' => $user->createToken('mobile')->plainTextToken,
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        $identifier = trim((string) ($data['identifier'] ?? $data['email'] ?? ''));
        $user = $this->findUserByIdentifier($identifier);

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales invalidas.'], 422);
        }

        return response()->json([
            'token' => $user->createToken('mobile')->plainTextToken,
            'user' => $this->userPayload($user),
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json($this->userPayload($request->user()));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    private function userPayload(User $user): array
    {
        if ($user->role === 'doctor') {
            return (new DoctorProfileResource($user->load('doctorProfile')))->resolve();
        }

        return $user->toArray();
    }

    private function findUserByIdentifier(string $identifier): ?User
    {
        if ($identifier === '') {
            return null;
        }

        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            return User::query()->where('email', $identifier)->first();
        }

        $patient = Patient::query()
            ->where('cedula', $identifier)
            ->with('user')
            ->first();

        if ($patient?->user) {
            return $patient->user;
        }

        $doctorProfile = DoctorProfile::query()
            ->where('cedula', $identifier)
            ->with('user')
            ->first();

        return $doctorProfile?->user;
    }
}
