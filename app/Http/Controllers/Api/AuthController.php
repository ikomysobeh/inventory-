<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
    ) {}

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        try {
            $result = $this->authService->login($credentials['email'], $credentials['password']);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'account_inactive') {
                return response()->json([
                    'message' => 'Your account is inactive. Please contact your manager.',
                ], 403);
            }
            throw $e;
        }

        if (!$result) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        return response()->json(['data' => $result]);
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        return response()->json(['data' => $this->authService->me($request->user())]);
    }
}
