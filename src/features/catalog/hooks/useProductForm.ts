import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { productEditorApi } from "../api/productEditorApi";
import { productApi, type Product } from "../api/productApi";
import {
  productFormSchema,
  type ProductFormData,
} from "../schema/productFormSchema";

const PRODUCT_QUERY_KEY = "products";

interface UseProductFormProps {
  productId?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useProductForm = ({
  productId,
  onSuccess,
  onError,
}: UseProductFormProps = {}) => {
  const queryClient = useQueryClient();

  const form = useForm<any>({
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

  // Mutation for upsert product
  const upsertProductMutation = useMutation({
    mutationFn: productEditorApi.upsertProduct,
    onSuccess: () => {
      toast.success("Produk berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEY] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error?.message || "Gagal menyimpan produk");
      onError?.(error);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const cleanedData = {
      ...data,
      description: data.description || undefined,
      sku: data.sku || undefined,
      compareAtPrice: data.compareAtPrice || undefined,
      cost: data.cost || undefined,
      weight: data.weight || undefined,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
    };

    const payload = {
      id: productId ?? 0,
      ...cleanedData,
    } as any;
    upsertProductMutation.mutate(payload);
  };

  // Helper functions
  const addImage = () => {
    imagesArray.append({
      url: "",
      alt: "",
      position: imagesArray.fields.length,
    });
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
    const currentOptions =
      form.getValues(`variants.${variantIndex}.options`) || [];
    form.setValue(`variants.${variantIndex}.options`, [
      ...currentOptions,
      { optionName: "", optionValue: "" },
    ]);
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const currentOptions =
      form.getValues(`variants.${variantIndex}.options`) || [];
    const newOptions = (
      currentOptions as Array<{ optionName: string; optionValue: string }>
    ).filter(
      (_: { optionName: string; optionValue: string }, i: number) =>
        i !== optionIndex
    );
    form.setValue(`variants.${variantIndex}.options`, newOptions);
  };

  const addAttribute = () => {
    attributesArray.append({
      name: "",
      value: "",
      position: attributesArray.fields.length,
    });
  };

  const removeAttribute = (index: number) => {
    attributesArray.remove(index);
  };

  return {
    form,
    onSubmit,
    isLoading: upsertProductMutation.isPending,
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

export async function getProduk(slug: string): Promise<Product> {
  const resp = await productApi.getProductBySlug(slug);
  if (!resp?.success || !resp.data) {
    throw new Error("Gagal mengambil produk: format respons tidak valid");
  }
  return resp.data;
}

export function mapProductToFormValue(product: Product): ProductFormData {
  if (!product || !product.id) {
    throw new Error("Data produk tidak valid atau kosong");
  }

  return {
    name: product.name,
    description: product.description || undefined,
    categoryId: product.categoryId,
    sku: product.sku || undefined,
    basePrice: product.basePrice,
    compareAtPrice: product.compareAtPrice || undefined,
    cost: product.cost || undefined,
    weight: product.weight || undefined,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    trackInventory: product.trackInventory,
    seoTitle: product.seoTitle || undefined,
    seoDescription: product.seoDescription || undefined,
    images:
      product.images?.map((m) => ({
        url: m.url,
        alt: m.alt || undefined,
        position: m.position,
      })) || [],
    variants:
      product.variants?.map((v) => ({
        title: v.title,
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice || undefined,
        cost: v.cost || undefined,
        weight: v.weight || undefined,
        barcode: v.barcode || undefined,
        image: v.image || undefined,
        position: v.position,
        isActive: v.isActive,
        inventory: v.inventory
          ? {
              quantity: v.inventory.quantity,
              reserved: v.inventory.reserved ?? 0,
              lowStockThreshold: v.inventory.lowStockThreshold || undefined,
            }
          : undefined,
        options: Array.isArray((v as any).options)
          ? (
              (v as any).options as Array<{
                optionName: string;
                optionValue: string;
              }>
            ).map((o) => ({
              optionName: o.optionName,
              optionValue: o.optionValue,
            }))
          : [],
      })) || [],
    attributes:
      (product as any).attributes?.map((a: any) => ({
        name: a.name,
        value: a.value,
        position: a.position,
      })) || [],
  };
}