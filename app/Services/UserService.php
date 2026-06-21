<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function getAll(array $filters = []): array
    {
        $query = User::query();

        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->orderBy('name')->get()->toArray();
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);
        return User::create($data);
    }

    /**
     * Update user — null values are ignored so they never overwrite existing data.
     */
    public function update(User $user, array $data): User
    {
        $user->update(array_filter($data, fn($v) => $v !== null));
        return $user->fresh();
    }

    /**
     * Reset password and revoke all tokens so the user must log in again.
     */
    public function resetPassword(User $user, string $newPassword): void
    {
        $user->update(['password' => Hash::make($newPassword)]);
        $user->tokens()->delete();
    }
}
