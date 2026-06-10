<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            User::query()
                ->select(['id', 'name', 'email', 'role', 'created_at', 'updated_at'])
                ->with('doctorProfile')
                ->orderBy('name')
                ->get()
        );
    }
}
