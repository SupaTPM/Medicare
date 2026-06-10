<?php

namespace App\Http\Controllers;

use App\Models\DeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401, 'No autenticado.');

        $data = $request->validate([
            'token' => ['required', 'string', 'max:255'],
            'platform' => ['nullable', 'string', 'max:32'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $deviceToken = DeviceToken::updateOrCreate(
            ['token' => $data['token']],
            [
                'user_id' => $user->id,
                'platform' => $data['platform'] ?? null,
                'device_name' => $data['device_name'] ?? null,
                'last_seen_at' => now(),
            ]
        );

        return response()->json($deviceToken, $deviceToken->wasRecentlyCreated ? 201 : 200);
    }
}
