<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private UserService $userService,
    ) {}

    public function index(Request $request)
    {
        $filters = array_filter([
            'role'      => $request->query('role'),
            'is_active' => $request->query('is_active'),
        ], fn($v) => $v !== null);

        return response()->json(['data' => $this->userService->getAll($filters)]);
    }

    public function store(StoreUserRequest $request)
    {
        $user = $this->userService->create($request->validated());

        return response()->json([
            'data' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'is_active'  => $user->is_active,
                'created_at' => $user->created_at,
            ],
            'message' => 'User created successfully.',
        ], 201);
    }

    public function show(User $user)
    {
        return response()->json([
            'data' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'is_active'  => $user->is_active,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $updated = $this->userService->update($user, $request->validated());

        return response()->json([
            'data' => [
                'id'        => $updated->id,
                'name'      => $updated->name,
                'email'     => $updated->email,
                'role'      => $updated->role,
                'is_active' => $updated->is_active,
            ],
            'message' => 'User updated successfully.',
        ]);
    }

    /**
     * Permanently delete a user account and revoke all their tokens.
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function resetPassword(ResetPasswordRequest $request, User $user)
    {
        $this->userService->resetPassword($user, $request->validated('password'));

        return response()->json([
            'message' => 'Password reset successfully. User must log in again.',
        ]);
    }
}
