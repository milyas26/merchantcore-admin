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
  const isEditMode = !!productId;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      sku: "",
      basePrice: 0,
      cost: undefined,
      weight: undefined,
      isActive: true,
      isFeatured: false,
      trackInventory: true,
      isVariant: false,
      inventory: {
        quantity: 0,
        reserved: 0,
        lowStockThreshold: 10,
      },
      seoTitle: "",
      seoDescription: "",
      images: [],
      variants: [],
      attributes: [],
    },
  });

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

  const upsertProductMutation = useMutation({
    mutationFn: productEditorApi.upsertProduct,
    onSuccess: async () => {
      toast.success(
        isEditMode ? "Produk berhasil diperbarui!" : "Produk berhasil dibuat!"
      );
      queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEY] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      const message = (error as any)?.error?.message || (error as any)?.message;
      toast.error(message || "Gagal menyimpan produk");
      onError?.(error);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const seoTitle = data.name || "";
    const seoDesc = data.description
      ? data.description.length > 160
        ? data.description.slice(0, 157) + "..."
        : data.description
      : undefined;

    const cleanedData: any = {
      ...data,
      description: data.description || undefined,
      sku: data.sku || undefined,
      cost: data.cost || undefined,
      weight: data.weight || undefined,
      seoTitle,
      seoDescription: seoDesc,
    };

    const hasVariants =
      Array.isArray(data.variants) && data.variants.length > 0;

    if (!data.isVariant) {
      const productInventory = data.trackInventory
        ? {
            quantity: data.inventory?.quantity ?? 0,
            reserved: data.inventory?.reserved ?? 0,
            lowStockThreshold: data.inventory?.lowStockThreshold ?? undefined,
          }
        : undefined;

      cleanedData.variants = [
        {
          title: "Default",
          sku: data.sku || "",
          price: data.basePrice,
          cost: data.cost ?? undefined,
          weight: data.weight ?? undefined,
          barcode: data.barcode || undefined,
          image: undefined,
          position: 0,
          isActive: data.isActive ?? true,
          inventory: productInventory,
          options: [],
        },
      ];
    } else if (!hasVariants) {
      cleanedData.variants = [
        {
          title: "Default",
          sku: data.sku || "",
          price: data.basePrice,
          cost: data.cost ?? undefined,
          weight: data.weight ?? undefined,
          barcode: undefined,
          image: undefined,
          position: 0,
          isActive: data.isActive ?? true,
          inventory: {
            quantity: 0,
            reserved: 0,
            lowStockThreshold: undefined,
          },
          options: [],
        },
      ];
    }

    const payload = {
      id: productId ?? 0,
      ...cleanedData,
    };
    upsertProductMutation.mutate(payload);
  };

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
    form.setValue("isVariant", true);
  };

  const removeVariant = (index: number) => {
    variantsArray.remove(index);
    const remaining = (form.getValues("variants") || []).length;
    if (remaining === 1) {
      form.setValue("isVariant", false);
    }
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
    isEditMode,
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

  const isVariant =
    (product as any).isVariant ??
    ((product.variants?.length ?? 0) > 1);

  const primaryVariant = product.variants?.[0];

  return {
    name: product.name,
    description: product.description || undefined,
    categoryId: product.categoryId,
    sku: product.sku || undefined,
    basePrice: product.basePrice,
    cost: product.cost ? Number(product.cost) : undefined,
    weight: product.weight ? Number(product.weight) : undefined,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    trackInventory: product.trackInventory,
    isVariant,
    barcode: primaryVariant?.barcode || undefined,
    inventory: primaryVariant?.inventory
      ? {
          quantity: primaryVariant.inventory.quantity,
          reserved: primaryVariant.inventory.reserved ?? 0,
          lowStockThreshold:
            primaryVariant.inventory.lowStockThreshold || undefined,
        }
      : undefined,
    seoTitle: product.seoTitle || undefined,
    seoDescription: product.seoDescription || undefined,
    images:
      product.images?.map((m) => ({
        url: m.url,
        alt: m.alt || undefined,
        position: m.position,
      })) || [],
    variants: isVariant
      ? product.variants?.map((v) => ({
          title: v.title,
          sku: v.sku,
          price: v.price,
          cost: v.cost ? Number(v.cost) : undefined,
          weight: v.weight ? Number(v.weight) : undefined,
          barcode: v.barcode || undefined,
          image: v.image || undefined,
          position: v.position,
          isActive: v.isActive,
          inventory: v.inventory
            ? {
                quantity: v.inventory.quantity,
                reserved: v.inventory.reserved ?? 0,
                lowStockThreshold:
                  v.inventory.lowStockThreshold || undefined,
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
        })) || []
      : [],
    attributes:
      (product as any).attributes?.map((a: any) => ({
        name: a.name,
        value: a.value,
        position: a.position,
      })) || [],
  };
}
