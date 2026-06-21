<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService,
    ) {}

    /**
     * Get all categories
     */
    public function index()
    {
        $categories = $this->categoryService->getAll();

        return response()->json([
            'data' => $categories,
        ]);
    }

    /**
     * Create new category
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = $this->categoryService->create($request->validated());

        return response()->json([
            'data' => $category,
            'message' => 'Category created successfully.',
        ], 201);
    }

    /**
     * Get single category
     */
    public function show(Category $category)
    {
        return response()->json([
            'data' => $category,
        ]);
    }

    /**
     * Update category
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $updated = $this->categoryService->update($category, $request->validated());

        return response()->json([
            'data' => $updated,
            'message' => 'Category updated successfully.',
        ]);
    }

    /**
     * Delete category
     */
    public function destroy(Category $category)
    {
        $result = $this->categoryService->delete($category);

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 422);
        }

        return response()->json([
            'message' => $result['message'],
        ]);
    }
}
