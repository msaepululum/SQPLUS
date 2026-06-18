<?php

namespace App\Models;

use App\Modules\Foundation\Models\OrganizationalUnit;
use App\Modules\Foundation\Models\Permission;
use App\Modules\Foundation\Models\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'phone', 'password', 'is_active', 'no_absen', 'rsud_user_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'rsud_user_id' => 'integer',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function organizationalUnits(): BelongsToMany
    {
        return $this->belongsToMany(OrganizationalUnit::class, 'organizational_unit_user')
            ->withPivot('is_primary');
    }

    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super_admin')) {
            return true;
        }

        return Permission::query()
            ->where('name', $permission)
            ->whereHas('roles', fn ($q) => $q->whereIn('roles.id', $this->roles()->pluck('roles.id')))
            ->exists();
    }

    public function permissionNames(): array
    {
        if ($this->hasRole('super_admin')) {
            return Permission::query()->pluck('name')->all();
        }

        return Permission::query()
            ->whereHas('roles', fn ($q) => $q->whereIn('roles.id', $this->roles()->pluck('roles.id')))
            ->pluck('name')
            ->unique()
            ->values()
            ->all();
    }
}
