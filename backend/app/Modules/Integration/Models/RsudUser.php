<?php

namespace App\Modules\Integration\Models;

use App\Support\RsudConnections;
use Illuminate\Database\Eloquent\Model;

/**
 * User operasional RSUD (database USER_MANAJEMEN) — read-only, tanpa migrasi.
 */
class RsudUser extends Model
{
    protected $connection;

    protected $table = 'users';

    public function __construct(array $attributes = [])
    {
        $this->connection = RsudConnections::USER_MANAJEMEN;
        parent::__construct($attributes);
    }

    public function isActive(): bool
    {
        return (string) $this->aktif === '1';
    }
}
