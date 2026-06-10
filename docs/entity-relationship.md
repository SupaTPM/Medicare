# RegistroMedico Entity Relationship

```mermaid
erDiagram
    users ||--o| patients : "owns profile"
    users ||--o{ appointments : "doctor"
    users ||--o{ medical_records : "doctor"
    users ||--o{ medical_documents : "uploads"
    users ||--o{ ai_logs : "requests"

    patients ||--o{ appointments : "has"
    patients ||--o{ medical_records : "has"
    patients ||--o{ medical_documents : "has"

    appointments ||--o| medical_records : "generates"
    appointments ||--o| qr_tokens : "has"

    users {
        bigint id PK
        text name
        text email UK
        text password
        text role
        text remember_token
        timestamptz created_at
        timestamptz updated_at
    }

    patients {
        bigint id PK
        bigint user_id FK
        text full_name
        text cedula UK
        date birth_date
        text sex
        text blood_type
        text phone
        text email
        text address
        text emergency_contact
        jsonb allergies
        jsonb previous_conditions
        jsonb current_medications
        text insurance_name
        timestamptz created_at
        timestamptz updated_at
    }

    appointments {
        bigint id PK
        bigint patient_id FK
        bigint doctor_id FK
        text specialty
        timestamptz scheduled_at
        text reason
        text observations
        text status
        timestamptz created_at
        timestamptz updated_at
    }

    medical_records {
        bigint id PK
        bigint appointment_id FK
        bigint patient_id FK
        bigint doctor_id FK
        text consultation_reason
        text symptoms
        text blood_pressure
        numeric temperature
        numeric weight
        numeric height
        text diagnosis
        text treatment
        text recommendations
        timestamptz next_control_at
        text ai_summary
        timestamptz created_at
        timestamptz updated_at
    }

    medical_documents {
        bigint id PK
        bigint patient_id FK
        bigint uploaded_by FK
        text title
        text document_type
        text file_path
        text file_mime
        timestamptz uploaded_at
        timestamptz created_at
        timestamptz updated_at
    }

    qr_tokens {
        bigint id PK
        bigint appointment_id FK
        text token UK
        timestamptz expires_at
        timestamptz scanned_at
        timestamptz created_at
        timestamptz updated_at
    }

    ai_logs {
        bigint id PK
        bigint user_id FK
        text action
        jsonb input_payload
        jsonb output_payload
        timestamptz created_at
        timestamptz updated_at
    }

    personal_access_tokens {
        bigint id PK
        text tokenable_type
        bigint tokenable_id
        text name
        text token UK
        text abilities
        timestamptz last_used_at
        timestamptz expires_at
        timestamptz created_at
        timestamptz updated_at
    }
```

## Relaciones

- `users` contiene usuarios de la app con roles: `patient`, `doctor`, `receptionist`, `admin`.
- `patients.user_id` vincula opcionalmente un paciente con su usuario de acceso.
- `appointments.patient_id` vincula cada cita a un paciente.
- `appointments.doctor_id` vincula opcionalmente la cita al doctor en `users`.
- `medical_records` vincula consulta médica con cita, paciente y doctor.
- `medical_documents` almacena documentos del paciente y el usuario que los subió.
- `qr_tokens` mantiene un token único por cita para acceso/escaneo.
- `ai_logs` registra acciones de IA por usuario opcional.
- `personal_access_tokens` mantiene compatibilidad con Laravel Sanctum.
