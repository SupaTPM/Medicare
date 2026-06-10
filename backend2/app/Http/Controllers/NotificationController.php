<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401, 'No autenticado.');

        return response()->json(
            AppNotification::query()
                ->where('user_id', $user->id)
                ->latest()
                ->limit(50)
                ->get()
        );
    }

    public function read(Request $request, AppNotification $notification): JsonResponse
    {
        $user = $request->user();
        abort_unless($user && $notification->user_id === $user->id, 403, 'No puedes modificar esta notificacion.');

        $notification->update(['read_at' => now()]);

        return response()->json($notification->refresh());
    }
}
