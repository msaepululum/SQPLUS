<?php

namespace App\Console\Commands;

use App\Support\RsudConnections;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class TestRsudDatabaseConnection extends Command
{
    protected $signature = 'db:test-rsud
                            {connection? : Nama koneksi (mis. rsud_payroll)}
                            {--all : Uji semua koneksi RSUD}';

    protected $description = 'Uji koneksi ke SQL Server RSUD Pasar Rebo (tanpa migrasi)';

    public function handle(): int
    {
        if ($this->option('all')) {
            return $this->testAll();
        }

        $connection = $this->argument('connection') ?? RsudConnections::PAYROLL;

        return $this->testOne($connection) ? self::SUCCESS : self::FAILURE;
    }

    private function testAll(): int
    {
        $failed = 0;

        foreach (RsudConnections::all() as $connection) {
            if (! $this->testOne($connection, compact: true)) {
                $failed++;
            }
            $this->newLine();
        }

        if ($failed > 0) {
            $this->error("{$failed} koneksi gagal.");

            return self::FAILURE;
        }

        $this->info('Semua koneksi RSUD berhasil.');

        return self::SUCCESS;
    }

    private function testOne(string $connection, bool $compact = false): bool
    {
        $label = RsudConnections::label($connection);
        $database = RsudConnections::databaseName($connection);

        try {
            DB::connection($connection)->getPdo();
            $host = config("database.connections.{$connection}.host");

            $this->info("✓ {$label} ({$connection})");
            $this->line("  Host: {$host} | Database: {$database}");

            if (! $compact) {
                $tables = DB::connection($connection)
                    ->select("SELECT TOP 5 TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");

                if ($tables !== []) {
                    $this->comment('  Contoh tabel:');
                    foreach ($tables as $table) {
                        $this->line('  - '.$table->TABLE_NAME);
                    }
                }
            }

            return true;
        } catch (Throwable $e) {
            $this->error("✗ {$label} ({$connection}): ".$e->getMessage());

            if (! $compact) {
                $this->newLine();
                $this->line('Pastikan extension PHP sqlsrv/pdo_sqlsrv terpasang dan RSUD_DB_* di .env sudah benar.');
            }

            return false;
        }
    }
}
