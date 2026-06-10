<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('specialty');
            $table->string('license_code')->nullable();
            $table->string('phone', 25)->nullable();
            $table->timestamps();
        });

        Schema::create('doctor_availability_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->string('status', 32)->default('available');
            $table->timestamps();

            $table->unique(['doctor_id', 'starts_at']);
            $table->index(['doctor_id', 'status', 'starts_at']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('availability_slot_id')
                ->nullable()
                ->after('doctor_id')
                ->constrained('doctor_availability_slots')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('availability_slot_id');
        });

        Schema::dropIfExists('doctor_availability_slots');
        Schema::dropIfExists('doctor_profiles');
    }
};
