import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "../services/categoryService";
import {
  categoryFormSchema,
  type CategoryFormData,
} from "../schema/categoryFormSchema";

const CATEGORY_QUERY_KEY = 'category';

interface UseCategoryFormProps {
  categoryId?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useCategoryForm = ({
  categoryId,
  onSuccess,
  onError,
}: UseCategoryFormProps = {}) => {
  const isEditMode = !!categoryId;

  // Fetch category data if in edit mode
  const { data: categoryData, isLoading: isLoadingCategory } = useQuery({
    queryKey: [CATEGORY_QUERY_KEY, categoryId],
    queryFn: () =>
      categoryId ? categoryService.getCategoryById(categoryId) : null,
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      image: "",
      parentId: undefined,
      isActive: true,
      sortOrder: 0,
    },
    values: categoryData?.data
      ? {
          name: categoryData.data.name,
          slug: categoryData.data.slug,
          image: categoryData.data.image || "",
          parentId: categoryData.data.parentId,
          isActive: categoryData.data.isActive,
          sortOrder: categoryData.data.position,
        }
      : undefined,
  });

  // Create or update category mutation
  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) => {
      const requestData = {
        name: data.name,
        slug: data.slug,
        image: data.image?.trim?.() === "" ? null : data.image,
        parentId: (data as any).parentId === null ? null : data.parentId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      };

      return isEditMode && categoryId
        ? categoryService.updateCategory(categoryId, requestData)
        : categoryService.createCategory(requestData);
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Category updated successfully"
          : "Category created successfully"
      );
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.error?.message || "An error occurred while saving the category";
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