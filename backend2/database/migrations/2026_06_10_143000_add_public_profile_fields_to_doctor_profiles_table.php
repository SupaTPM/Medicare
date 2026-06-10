<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctor_profiles', function (Blueprint $table): void {
            $table->string('profile_photo_path')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('profile_photo_path');
            $table->string('education')->nullable()->after('bio');
            $table->unsignedSmallInteger('experience_years')->nullable()->after('education');
            $table->json('languages')->nullable()->after('experience_years');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_profiles', function (Blueprint $table): void {
            $table->dropColumn([
                'profile_photo_path',
                'bio',
                'education',
                'experience_years',
                'languages',
            ]);
        });
    }
};
