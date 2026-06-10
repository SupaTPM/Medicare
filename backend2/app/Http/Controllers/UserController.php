<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->abortUnlessStaff($request->user());

        return response()->json(
            User::query()
                ->select(['id', 'name', 'email', 'role', 'created_at', 'updated_at'])
                ->with('doctorProfile')
                ->orderBy('name')
                ->get()
        );
    }
}
