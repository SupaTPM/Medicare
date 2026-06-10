<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_tokens', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token')->unique();
            $table->string('platform', 32)->nullable();
            $table->string('device_name')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'last_seen_at']);
        });

        Schema::create('app_notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type', 64);
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->text('push_error')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'appointment_id', 'type']);
            $table->index(['user_id', 'read_at', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('device_tokens');
    }
};
