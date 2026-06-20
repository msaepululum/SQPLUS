<?php

namespace App\Modules\Finance\Models\Rsud;

use App\Support\RsudConnections;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

abstract class RsudFinanceModel extends Model
{
    use SoftDeletes;

    protected $connection = RsudConnections::FINANCE;

    public $timestamps = false;

    const CREATED_AT = 'created_at';

    const UPDATED_AT = 'updated_at';

    const DELETED_AT = 'deleted_at';
}
