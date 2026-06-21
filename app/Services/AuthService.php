<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthService
{
    /**
     * Authenticate user and return token data.
     * Returns null for bad credentials.
     * Throws \RuntimeException('account_inactive') for disabled accounts.
     */
    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        Log::info('[AuthService] User lookup', [
            'email'     => $email,
            'found'     => $user ? true : false,
            'is_active' => $user?->is_active,
        ]);

        if (!$user) {
            Log::warning('[AuthService] No user found for email', ['email' => $email]);
            return null;
        }

        $passwordMatch = Hash::check($password, $user->password);
        Log::info('[AuthService] Password check', [
            'email'          => $email,
            'password_match' => $passwordMatch,
            'password_len'   => strlen($password),
        ]);

        if (!$passwordMatch) {
            Log::warning('Login failed: invalid credentials', ['email' => $email]);
            return null;
        }

        if (!$user->is_active) {
            Log::warning('Login blocked: inactive account', ['email' => $email]);
            throw new \RuntimeException('account_inactive');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Login successful', ['user_id' => $user->id, 'email' => $user->email]);

        return [
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
            'token' => $token,
        ];
    }

    /**
     * Revoke the current token on logout.
     */
    public function logout(User $user): void
    {
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        } else {
            $user->tokens()->delete();
        }
    }

    /**
     * Return public profile of the authenticated user.
     */
    public function me(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }
}
