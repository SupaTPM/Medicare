<?php

use App\Http\Controllers\AIController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DoctorProfileController;
use App\Http\Controllers\DeviceTokenController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/patients/device-registration', [PatientController::class, 'deviceRegistration']);
Route::post('/patients/cedula-login', [PatientController::class, 'cedulaLogin']);
Route::post('/appointments/public', [AppointmentController::class, 'publicStore']);
Route::get('/schedule/specialties', [ScheduleController::class, 'specialties']);
Route::get('/schedule/doctors', [ScheduleController::class, 'doctors']);
Route::get('/schedule/doctors/{doctor}/profile', [DoctorProfileController::class, 'show']);
Route::get('/schedule/doctors/{doctor}/availability', [ScheduleController::class, 'availability']);
Route::get('/schedule/doctors/{doctor}/reviews', [ReviewController::class, 'indexForDoctor']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::get('/me/doctor-profile', [DoctorProfileController::class, 'me']);
    Route::post('/doctors/{doctor}/profile', [DoctorProfileController::class, 'update']);
    Route::get('/me/patient', [PatientController::class, 'me']);
    Route::put('/me/patient', [PatientController::class, 'completeProfile']);
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/device-tokens', [DeviceTokenController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read']);

    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/search', [PatientController::class, 'search']);
    Route::get('/patients/{patient}', [PatientController::class, 'show']);
    Route::put('/patients/{patient}', [PatientController::class, 'update']);
    Route::get('/patients/{patient}/medical-records', [MedicalRecordController::class, 'index']);
    Route::get('/patients/{patient}/documents', [DocumentController::class, 'index']);

    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show']);
    Route::put('/appointments/{appointment}', [AppointmentController::class, 'update']);
    Route::put('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus']);
    Route::post('/appointments/{appointment}/generate-qr', [AppointmentController::class, 'generateQr']);
    Route::post('/appointments/scan-qr', [AppointmentController::class, 'scanQr']);
    Route::post('/appointments/{appointment}/review', [ReviewController::class, 'store']);

    Route::post('/medical-records', [MedicalRecordController::class, 'store']);
    Route::post('/documents', [DocumentController::class, 'store']);

    Route::post('/ai/summarize-record', [AIController::class, 'summarizeRecord']);
    Route::post('/ai/check-missing-fields', [AIController::class, 'checkMissingFields']);
});
