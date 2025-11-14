import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productEditorApi } from "../api/productEditorApi";
import { productFormSchema, type ProductFormData } from "../schema/productFormSchema";

const PRODUCT_QUERY_KEY = 'products';

interface UseProductFormProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useProductForm = ({ onSuccess, onError }: UseProductFormProps = {}) => {
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      sku: "",
      basePrice: 0,
      compareAtPrice: undefined,
      cost: undefined,
      weight: undefined,
      isActive: true,
      isFeatured: false,
      trackInventory: true,
      seoTitle: "",
      seoDescription: "",
      images: [],
      variants: [],
      attributes: [],
    },
  });

  // Field arrays for dynamic fields
  const imagesArray = useFieldArray({
    control: form.control,
    name: "images",
  });

  const variantsArray = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const attributesArray = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  // Mutation for creating product
  const createProductMutation = useMutation({
    mutationFn: productEditorApi.createProduct,
    onSuccess: () => {
      toast.success("Produk berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEY] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error?.message || "Gagal membuat produk");
      onError?.(error);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    // Clean up empty optional fields and remove slug since backend will generate it
    const { slug, ...dataWithoutSlug } = data;
    const cleanedData = {
      ...dataWithoutSlug,
      description: data.description || undefined,
      sku: data.sku || undefined,
      compareAtPrice: data.compareAtPrice || undefined,
      cost: data.cost || undefined,
      weight: data.weight || undefined,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
    };

    createProductMutation.mutate(cleanedData);
  };

  // Helper functions
  const addImage = () => {
    imagesArray.append({ url: "", alt: "", position: imagesArray.fields.length });
  };

  const removeImage = (index: number) => {
    imagesArray.remove(index);
  };

  const addVariant = () => {
    variantsArray.append({
      title: "",
      sku: "",
      price: 0,
      compareAtPrice: undefined,
      cost: undefined,
      weight: undefined,
      barcode: "",
      image: "",
      position: variantsArray.fields.length,
      isActive: true,
      inventory: {
        quantity: 0,
        reserved: 0,
        lowStockThreshold: 10,
      },
      options: [],
    });
  };

  const removeVariant = (index: number) => {
    variantsArray.remove(index);
  };

  const addVariantOption = (variantIndex: number) => {
    const currentOptions = form.getValues(`variants.${variantIndex}.options`) || [];
    form.setValue(`variants.${variantIndex}.options`, [
      ...currentOptions,
      { optionName: "", optionValue: "" }
    ]);
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`variants.${variantIndex}.options`) || [];
    const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
    form.setValue(`variants.${variantIndex}.options`, newOptions);
  };

  const addAttribute = () => {
    attributesArray.append({ name: "", value: "", position: attributesArray.fields.length });
  };

  const removeAttribute = (index: number) => {
    attributesArray.remove(index);
  };

  return {
    form,
    onSubmit,
    isLoading: createProductMutation.isPending,
    imagesArray,
    variantsArray,
    attributesArray,
    addImage,
    removeImage,
    addVariant,
    removeVariant,
    addVariantOption,
    removeVariantOption,
    addAttribute,
    removeAttribute,
  };
};