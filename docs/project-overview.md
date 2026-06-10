# RegistroMedico Project Overview

## Summary
RegistroMedico es un sistema de gestion clinica con dos partes principales: una app movil Expo/React Native y una API Laravel. El objetivo del producto es cubrir el flujo operativo de pacientes, doctores, recepcion y administracion desde un mismo ecosistema, con agenda, historias clinicas, documentos, QR y autenticacion basada en roles.

## Current Features

### Backend
- Autenticacion con Laravel Sanctum para usuarios internos y pacientes.
- Registro e ingreso de paciente por cedula con creacion o actualizacion de `users` y `patients`.
- Vinculo entre paciente y usuario mediante `patients.user_id`.
- Busqueda y gestion de pacientes para roles operativos.
- Agenda por especialidad, medico y disponibilidad.
- Creacion de citas publicas y autenticadas con bloqueo de turno.
- Consulta de citas, historiales clinicos, documentos y QR de cita.
- Endpoints de IA para resumen de registros y deteccion de campos faltantes.

### Mobile
- Navegacion por roles con vistas distintas para `patient`, `doctor`, `receptionist` y `admin`.
- Pantalla de ingreso de paciente por cedula con token real.
- Persistencia de sesion en almacenamiento seguro.
- Carga de pacientes, citas, medicos, turnos, historiales y documentos desde API real.
- Creacion de citas con seleccion de especialidad, medico y turno disponible.
- Pantallas de acceso por cedula, acceso de doctor y QR.
- Estado global centralizado en `AppContext`.

### Data Model
- `users` contiene los roles y credenciales base.
- `patients` guarda el perfil medico y el enlace opcional al usuario.
- `appointments` une paciente, medico, especialidad y turno.
- `medical_records` registra la atencion clinica.
- `medical_documents` almacena archivos del paciente.
- `qr_tokens` representa el acceso QR por cita.
- `ai_logs` conserva trazabilidad de llamadas de IA.

## Improvement Plan

### Short Term
- Ejecutar la suite de pruebas de Laravel en un entorno con `pdo_sqlite` o una base de pruebas configurada.
- Corregir textos y mensajes con caracteres mal codificados en la documentacion y la UI.
- Sincronizar el nombre real del backend en la documentacion raiz, que todavia menciona `backend` cuando el proyecto usa `backend2`.

### Medium Term
- Endurecer el login por cedula con OTP, SMS o correo.
- Formalizar politicas y autorizacion de Laravel para pacientes, doctores y recepcion.
- Anadir validacion fuerte de cedula y normalizacion de datos de contacto.
- Mejorar revocacion y renovacion de tokens de Sanctum.

### Product Growth
- Flujo completo de confirmacion, cancelacion y reagendamiento de citas.
- Notificaciones para cambios de cita y recordatorios.
- Carga y gestion real de documentos adjuntos.
- Auditoria de acciones clinicas y operativas.
- Observabilidad de errores de API y trazabilidad por entorno.

## Useful Commands

### Mobile
```powershell
cd mobile
npm.cmd install
npm.cmd run typecheck
npm.cmd run start
```

### Backend
```powershell
cd backend2
composer install
php artisan migrate --seed
php artisan test
php artisan serve
```

## Notes
- Las rutas protegidas usan `auth:sanctum`.
- El flujo principal de paciente ya no depende de datos mock.
- El documento `docs/entity-relationship.md` sigue siendo la referencia de relaciones entre tablas.
- `php artisan test` necesita un driver SQLite funcional o una base de pruebas equivalente.
