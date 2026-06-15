<?php

namespace App\Modules\Foundation\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditTrailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly AuditTrailService $auditTrail) {}

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', $credentials['email'])
            ->where('is_active', true)
            ->with(['roles', 'organizationalUnits'])
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial tidak valid.'],
            ]);
        }

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
