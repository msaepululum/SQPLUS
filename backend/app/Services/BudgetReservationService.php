<?php

namespace App\Services;

/**
 * Reservasi dan pelepasan anggaran (commitment accounting).
 */
class BudgetReservationService
{
    public function reserve(int $budgetLineId, float $amount, string $reference): void
    {
        // TODO: reserve budget
    }

    public function release(int $budgetLineId, float $amount, string $reference): void
    {
        // TODO: release reservation
    }
}
