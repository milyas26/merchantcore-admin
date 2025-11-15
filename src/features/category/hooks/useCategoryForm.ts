import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "../services/categoryService";
import { categoryFormSchema, type CategoryFormData } from "../schema/categoryFormSchema";

const CATEGORIES_QUERY_KEY = 'categories';
const CATEGORY_QUERY_KEY = 'category';

interface UseCategoryFormProps {
  categoryId?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCategoryForm = ({ categoryId, onSuccess, onError }: UseCategoryFormProps = {}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!categoryId;

  // Fetch category data if in edit mode
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: [CATEGORY_QUERY_KEY, categoryId],
    queryFn: () => categoryId ? categoryService.getCategoryById(categoryId) : null,
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "",
      parentId: undefined,
      isActive: true,
      sortOrder: 0,
    },
    values: categoryData?.data ? {
      name: categoryData.data.name,
      slug: categoryData.data.slug,
      description: categoryData.data.description || "",
      image: categoryData.data.image || "",
      parentId: categoryData.data.parentId || undefined,
      isActive: categoryData.data.isActive,
      sortOrder: categoryData.data.position,
    } : undefined,
  });

  // Create or update category mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      const requestData = {
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        image: data.image || undefined,
        parentId: data.parentId || undefined,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      };
      
      return isEditMode && categoryId
        ? categoryService.updateCategory(categoryId, requestData)
        : categoryService.createCategory(requestData);
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Category updated successfully" : "Category created successfully");
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CATEGORY_QUERY_KEY, categoryId] });
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error?.error?.message || "An error occurred while saving the category";
      toast.error(errorMessage);
      onError?.(error);
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    createMutation.mutate(data);
  };

  return {
    form,
    onSubmit,
    isLoading: createMutation.isPending || isLoadingCategory,
    isEditMode,
  };
};