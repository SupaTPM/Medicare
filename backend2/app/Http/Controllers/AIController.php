<?php

namespace App\Http\Controllers;

use App\Models\AILog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function summarizeRecord(Request $request): JsonResponse
    {
        $data = $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $response = [
            'summary' => 'Paciente con sintomas respiratorios y evolucion corta. Se recomienda evaluacion fisica, control de signos vitales y seguimiento segun respuesta clinica.',
        ];

        AILog::create([
            'user_id' => $request->user()?->id,
            'action' => 'summarize-record',
            'input_payload' => $data,
            'output_payload' => $response,
        ]);

        return response()->json($response);
    }

    public function checkMissingFields(Request $request): JsonResponse
    {
        $data = $request->validate([
            'blood_pressure' => ['nullable', 'string'],
            'temperature' => ['nullable'],
            'weight' => ['nullable'],
            'height' => ['nullable'],
        ]);

        $missing = [];

        foreach (['blood_pressure', 'temperature', 'weight', 'height'] as $field) {
          if (empty($data[$field])) {
              $missing[] = $field;
          }
        }

        $response = ['missing_fields' => $missing];

        AILog::create([
            'user_id' => $request->user()?->id,
            'action' => 'check-missing-fields',
            'input_payload' => $data,
            'output_payload' => $response,
        ]);

        return response()->json($response);
    }
}
