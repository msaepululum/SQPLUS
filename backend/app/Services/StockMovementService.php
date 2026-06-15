<?php

namespace App\Services;

/**
 * Pergerakan stok inventori (in/out/transfer/adjustment).
 */
class StockMovementService
{
    public function move(
        int $itemId,
        int $warehouseId,
        float $quantity,
        string $movementType,
        string $reference
    ): void {
        // TODO: record stock movement
    }
}
