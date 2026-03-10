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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->onDelete('cascade');
            $table->foreignId('resident_id')->constrained()->onDelete('cascade');
            $table->integer('year');
            $table->integer('month'); // billing month
            $table->enum('payment_type', ['kebersihan', 'satpam', 'both'])->default('both');
            $table->integer('months_paid')->default(1); // for annual payment
            $table->decimal('amount', 15, 2);
            $table->date('paid_at')->nullable();
            $table->enum('status', ['lunas', 'belum'])->default('belum');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
