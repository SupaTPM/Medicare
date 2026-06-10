<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('full_name');
            $table->string('cedula', 20)->unique();
            $table->date('birth_date')->nullable();
            $table->string('sex', 20)->nullable();
            $table->string('blood_type', 10)->nullable();
            $table->string('phone', 25)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->json('allergies')->nullable();
            $table->json('previous_conditions')->nullable();
            $table->json('current_medications')->nullable();
            $table->string('insurance_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
