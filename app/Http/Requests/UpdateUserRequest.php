<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');
        return [
            'name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'unique:users,email,' . $userId],
            'is_active' => ['nullable', 'boolean'],
            'role' => ['nullable', 'in:manager,employee'],
        ];
    }
}
