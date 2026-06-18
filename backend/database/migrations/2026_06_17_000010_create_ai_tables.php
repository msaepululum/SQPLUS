<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('status', 20)->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'updated_at']);
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_session_id')->constrained('ai_sessions')->cascadeOnDelete();
            $table->string('role', 20);
            $table->text('content');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['ai_session_id', 'created_at']);
        });

        Schema::create('ai_tool_calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_message_id')->constrained('ai_messages')->cascadeOnDelete();
            $table->string('tool_name', 100);
            $table->json('input')->nullable();
            $table->json('output')->nullable();
            $table->string('status', 20)->default('completed');
            $table->unsignedInteger('duration_ms')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_message_id')->constrained('ai_messages')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('rating');
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['ai_message_id', 'user_id']);
        });

        Schema::create('ai_guardrail_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_session_id')->nullable()->constrained('ai_sessions')->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('trigger_type', 50);
            $table->text('user_message');
            $table->text('response');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_guardrail_logs');
        Schema::dropIfExists('ai_feedback');
        Schema::dropIfExists('ai_tool_calls');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_sessions');
    }
};
