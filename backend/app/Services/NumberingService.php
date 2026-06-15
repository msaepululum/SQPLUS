<?php

namespace App\Services;

/**
 * Penomoran otomatis dokumen (PR, PO, JV, dll).
 */
class NumberingService
{
    public function next(string $documentType, ?string $prefix = null): string
    {
        // TODO: generate sequential number
        return $prefix ? "{$prefix}-000001" : '000001';
    }
}
