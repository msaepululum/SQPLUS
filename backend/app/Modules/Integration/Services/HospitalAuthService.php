<?php

namespace App\Modules\Integration\Services;

use App\Models\User;
use App\Modules\Foundation\Models\Role;
use App\Modules\Integration\Models\RsudUser;
use App\Support\RsudConnections;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class HospitalAuthService
{
    public function findByEmployeeNumber(string $noAbsen): ?RsudUser
    {
        $normalized = trim($noAbsen);

        if ($normalized === '') {
            return null;
        }

        /** @var RsudUser|null $user */
        $user = RsudUser::query()
            ->where('no_absen', $normalized)
            ->first();

        return $user;
    }

    public function verifyPassword(RsudUser $rsudUser, string $password): bool
    {
        $stored = (string) $rsudUser->password;

        if ($stored === '') {
            return false;
        }

        if (Str::startsWith($stored, '$2y$') || Str::startsWith($stored, '$2a$') || Str::startsWith($stored, '$2b$')) {
            return Hash::check($password, $stored);
        }

        return hash_equals($stored, $password);
    }

    public function authenticate(string $noAbsen, string $password): ?RsudUser
    {
        $rsudUser = $this->findByEmployeeNumber($noAbsen);

        if (! $rsudUser || ! $rsudUser->isActive() || ! $this->verifyPassword($rsudUser, $password)) {
            return null;
        }

        $this->touchLastLogin($rsudUser);

        return $rsudUser;
    }

    public function resolveLocalUser(RsudUser $rsudUser): User
    {
        $local = User::query()
            ->where(function ($query) use ($rsudUser) {
                $query->where('no_absen', $rsudUser->no_absen)
                    ->orWhere('rsud_user_id', $rsudUser->id);
            })
            ->first();

        if (! $local && filled($rsudUser->email)) {
            $local = User::query()->where('email', $rsudUser->email)->first();
        }

        $email = $this->resolveEmail($rsudUser, $local);

        $attributes = [
            'name' => $rsudUser->name,
            'email' => $email,
            'no_absen' => $rsudUser->no_absen,
            'rsud_user_id' => $rsudUser->id,
            'is_active' => true,
        ];

        if ($local) {
            $local->fill($attributes);
            $local->save();
        } else {
            $local = User::query()->create([
                ...$attributes,
                'password' => Hash::make(Str::random(40)),
            ]);

            $employeeRole = Role::query()->where('name', 'employee')->first();
            if ($employeeRole) {
                $local->roles()->syncWithoutDetaching([$employeeRole->id]);
            }
        }

        return $local->load(['roles', 'organizationalUnits']);
    }

    private function resolveEmail(RsudUser $rsudUser, ?User $existing): string
    {
        $candidate = Str::lower(trim((string) $rsudUser->email));

        if ($candidate !== '' && filter_var($candidate, FILTER_VALIDATE_EMAIL)) {
            $taken = User::query()
                ->where('email', $candidate)
                ->when($existing, fn ($q) => $q->where('id', '!=', $existing->id))
                ->exists();

            if (! $taken) {
                return $candidate;
            }
        }

        if ($existing?->email) {
            return $existing->email;
        }

        return 'pegawai.'.$rsudUser->no_absen.'@sqplus.local';
    }

    private function touchLastLogin(RsudUser $rsudUser): void
    {
        DB::connection(RsudConnections::USER_MANAJEMEN)
            ->table('users')
            ->where('id', $rsudUser->id)
            ->update(['last_logged_in' => now()]);
    }
}
