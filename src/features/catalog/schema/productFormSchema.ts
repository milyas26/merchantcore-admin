import { z } from "zod";

// Product form schemas
export const productImageFormSchema = z.object({
  url: z.string().url("URL gambar tidak valid"),
  alt: z.string().optional(),
  position: z.number().int().nonnegative().optional().default(0),
});

export const variantOptionFormSchema = z.object({
  optionName: z.string().min(1, "Nama opsi wajib diisi").max(50, "Nama opsi maksimal 50 karakter"),
  optionValue: z.string().min(1, "Nilai opsi wajib diisi").max(100, "Nilai opsi maksimal 100 karakter"),
});

export const productVariantFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Judul varian wajib diisi")
      .max(255, "Judul varian maksimal 255 karakter"),
    sku: z
      .string()
      .min(1, "SKU wajib diisi")
      .max(100, "SKU maksimal 100 karakter"),
    price: z.number().positive("Harga jual harus positif"),
    cost: z.number().positive("HPP harus positif").optional(),
    weight: z.number().positive("Berat harus positif").optional(),
    barcode: z.string().max(100, "Barcode maksimal 100 karakter").optional(),
    image: z.string().optional(),
    position: z.number().int().nonnegative().optional().default(0),
    isActive: z.boolean().optional().default(true),
    inventory: z
      .object({
        quantity: z.number().int().nonnegative("Stok tidak boleh negatif"),
        reserved: z.number().int().nonnegative().optional().default(0),
        lowStockThreshold: z
          .number()
          .int()
          .positive("Ambang stok rendah harus positif")
          .optional(),
      })
      .optional(),
    options: z.array(variantOptionFormSchema).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.cost !== undefined && val.price <= val.cost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Harga jual harus lebih besar dari HPP",
        path: ["price"],
      });
    }
  });

export const productAttributeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nama atribut wajib diisi")
    .max(100, "Nama atribut maksimal 100 karakter"),
  value: z
    .string()
    .min(1, "Nilai atribut wajib diisi")
    .max(500, "Nilai atribut maksimal 500 karakter"),
  position: z.number().int().nonnegative().optional().default(0),
});

export const productFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama produk wajib diisi")
      .max(255, "Nama produk maksimal 255 karakter"),
    description: z.string().optional(),
    categoryId: z.string("Kategori harus dipilih"),
    sku: z
      .string()
      .min(1, "SKU wajib diisi")
      .max(100, "SKU maksimal 100 karakter")
      .optional(),
    basePrice: z.number().positive("Harga jual harus positif"),
    cost: z.number().positive("HPP harus positif").optional(),
    weight: z.number().positive("Berat harus positif").optional(),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    trackInventory: z.boolean().optional().default(true),
    isVariant: z.boolean().optional().default(false),
    barcode: z.string().optional(),
    inventory: z
      .object({
        quantity: z.number().int().nonnegative("Quantity harus positif"),
        reserved: z.number().int().nonnegative().optional().default(0),
        lowStockThreshold: z
          .number()
          .int()
          .positive("Ambang stok rendah harus positif")
          .optional(),
      })
      .optional(),
    seoTitle: z.string().max(255, "Judul SEO maksimal 255 karakter").optional(),
    seoDescription: z
      .string()
      .max(500, "Deskripsi SEO maksimal 500 karakter")
      .optional(),
    images: z.array(productImageFormSchema).optional(),
    variants: z.array(productVariantFormSchema).optional(),
    attributes: z.array(productAttributeFormSchema).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.cost !== undefined && val.basePrice <= val.cost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Harga jual harus lebih besar dari HPP",
        path: ["basePrice"],
      });
    }
  });

export type ProductFormData = z.infer<typeof productFormSchema>;
export type ProductImageFormData = z.infer<typeof productImageFormSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantFormSchema>;
export type ProductAttributeFormData = z.infer<typeof productAttributeFormSchema>;
export type VariantOptionFormData = z.infer<typeof variantOptionFormSchema>;