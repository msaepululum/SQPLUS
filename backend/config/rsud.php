<?php

/**
 * Koneksi SQL Server RSUD Pasar Rebo (database operasional yang sudah ada).
 * Hanya untuk integrasi / read — JANGAN jalankan migrate ke koneksi ini.
 */
return [

    'host' => env('RSUD_DB_HOST', '10.0.10.204'),
    'port' => env('RSUD_DB_PORT', '1433'),
    'username' => env('RSUD_DB_USERNAME'),
    'password' => env('RSUD_DB_PASSWORD'),
    'charset' => env('RSUD_DB_CHARSET', 'utf8'),
    'encrypt' => env('RSUD_DB_ENCRYPT', 'yes'),
    'trust_server_certificate' => env('RSUD_DB_TRUST_SERVER_CERTIFICATE', true),

    /*
    |--------------------------------------------------------------------------
    | Nama koneksi Laravel => database SQL Server (sesuai server RSUD)
    |--------------------------------------------------------------------------
    */
    'connections' => [
        'rsud_acc2026' => [
            'database' => 'ACCRSPR2026',
            'label' => 'ACC2026',
        ],
        'rsud_simartdb' => [
            'database' => 'SIMARTDB',
            'label' => 'SIMARTDB',
        ],
        'rsud_user_manajemen' => [
            'database' => 'USER_MANAJEMEN',
            'label' => 'User Manajemen',
        ],
        'rsud_payroll' => [
            'database' => 'Payroll',
            'label' => 'Payroll',
        ],
        'rsud_hris' => [
            'database' => 'HRIS',
            'label' => 'HRIS',
        ],
        'rsud_asset' => [
            'database' => 'ASSET_MANAJEMEN',
            'label' => 'Asset Manajemen',
        ],
        'rsud_mesin_absensi' => [
            'database' => 'MESIN_ABSENSI',
            'label' => 'Mesin Absensi',
        ],
        'rsud_finance' => [
            'database' => 'FINANCE',
            'label' => 'Finance',
        ],
        'rsud_simrs_v2' => [
            'database' => 'SIMRS_V2',
            'label' => 'SIMRS V2',
        ],
    ],

];
