<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('phone_number', 20);
            $table->string('ktp_photo')->nullable();
            $table->enum('status', ['tetap', 'kontrak'])->default('tetap');
            $table->boolean('is_married')->default(false);
            $table->date('contract_start')->nullable();
            $table->date('contract_end')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
