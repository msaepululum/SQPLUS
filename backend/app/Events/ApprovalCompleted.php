<?php

namespace App\Events;

use App\Modules\Workflow\Models\ApprovalInstance;
use Illuminate\Foundation\Events\Dispatchable;

class ApprovalCompleted
{
    use Dispatchable;

    public function __construct(
        public readonly ApprovalInstance $instance,
        public readonly string $outcome,
    ) {}
}
