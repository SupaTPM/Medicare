<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\MedicalDocument;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request, Patient $patient): JsonResponse
    {
        $user = $request->user();

        if ($user?->role === UserRole::Patient->value) {
            abort_unless($user->patient?->is($patient), 403, 'No puedes ver documentos de otro paciente.');
        }

        return response()->json($patient->documents()->latest('uploaded_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'uploaded_by' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'string', 'max:100'],
            'file_path' => ['nullable', 'string'],
            'file_mime' => ['nullable', 'string', 'max:120'],
        ]);

        $document = MedicalDocument::create([
            ...$data,
            'uploaded_at' => now(),
        ]);

        return response()->json($document, 201);
    }
}
