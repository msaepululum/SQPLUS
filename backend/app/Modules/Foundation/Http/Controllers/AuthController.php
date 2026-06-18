<?php

namespace App\Modules\Foundation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Integration\Services\HospitalAuthService;
use App\Services\AuditTrailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuditTrailService $auditTrail,
        private readonly HospitalAuthService $hospitalAuth,
    ) {}

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'no_absen' => ['required', 'string', 'max:20'],
            'password' => ['required', 'string'],
        ]);

        $rsudUser = $this->hospitalAuth->authenticate(
            $credentials['no_absen'],
            $credentials['password'],
        );

        if (! $rsudUser) {
            throw ValidationException::withMessages([
                'no_absen' => ['Nomor kepegawaian atau kata sandi salah.'],
            ]);
        }

        $user = $this->hospitalAuth->resolveLocalUser($rsudUser);

        $token = $user->createToken('sq-plus-web')->plainTextToken;

        $this->auditTrail->log('auth.login', 'user', $user->id, $user->id);

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => $this->formatUser($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $request->user()->currentAccessToken()?->delete();

        $this->auditTrail->log('auth.logout', 'user', $user?->id, $user?->id);

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'organizationalUnits']);

        return response()->json(['data' => $this->formatUser($user)]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'no_absen' => $user->no_absen,
            'phone' => $user->phone,
            'roles' => $user->roles->pluck('name'),
            'permissions' => $user->permissionNames(),
            'organizational_units' => $user->organizationalUnits->map(fn ($u) => [
                'id' => $u->id,
                'code' => $u->code,
                'name' => $u->name,
                'is_primary' => (bool) $u->pivot->is_primary,
            ]),
        ];
    }
}
