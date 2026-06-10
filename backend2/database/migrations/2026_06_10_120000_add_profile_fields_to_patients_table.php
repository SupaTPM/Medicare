<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->json('chronic_conditions')->nullable()->after('previous_conditions');
            $table->boolean('has_disability')->default(false)->after('chronic_conditions');
            $table->string('disability_type')->nullable()->after('has_disability');
            $table->unsignedTinyInteger('disability_percentage')->nullable()->after('disability_type');
            $table->timestamp('profile_completed_at')->nullable()->after('insurance_name');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'chronic_conditions',
                'has_disability',
                'disability_type',
                'disability_percentage',
                'profile_completed_at',
            ]);
        });
    }
};
