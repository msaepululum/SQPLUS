<?php

namespace App\Support;

/**
 * Nama koneksi Laravel ke SQL Server RSUD Pasar Rebo.
 *
 * @see config/rsud.php
 */
final class RsudConnections
{
    public const ACC2026 = 'rsud_acc2026';

    public const SIMARTDB = 'rsud_simartdb';

    public const USER_MANAJEMEN = 'rsud_user_manajemen';

    public const PAYROLL = 'rsud_payroll';

    public const HRIS = 'rsud_hris';

    public const ASSET = 'rsud_asset';

    public const MESIN_ABSENSI = 'rsud_mesin_absensi';

    public const FINANCE = 'rsud_finance';

    public const SIMRS_V2 = 'rsud_simrs_v2';

    /** @return list<string> */
    public static function all(): array
    {
        return array_keys(config('rsud.connections', []));
    }

    public static function label(string $connection): string
    {
        return (string) (config("rsud.connections.{$connection}.label") ?? $connection);
    }

    public static function databaseName(string $connection): string
    {
        return (string) (config("rsud.connections.{$connection}.database") ?? '');
    }
}
