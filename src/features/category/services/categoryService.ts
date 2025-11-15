import { categoryApi } from "../api/categoryApi";
import type {
  GetCategoriesQuery,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../api/categoryApi";

export class CategoryService {
  private static instance: CategoryService;

  private constructor() {}

  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async getCategories(query?: GetCategoriesQuery) {
    return categoryApi.getCategories(query);
  }

  async getCategoryById(id: string) {
    return categoryApi.getCategoryById(id);
  }

  async createCategory(data: CreateCategoryRequest) {
    return categoryApi.createCategory(data);
  }

  async updateCategory(id: string, data: UpdateCategoryRequest) {
    return categoryApi.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    return categoryApi.deleteCategory(id);
  }
}

export const categoryService = CategoryService.getInstance();
