import { z } from "zod";

export const promotionFormSchema = z
  .object({
    title: z.string().min(1, "Judul promosi wajib diisi").max(255),
    description: z.string().optional(),
    couponCode: z.string().max(100, "Kode kupon maksimal 100 karakter").optional().or(z.literal("")),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"], {
      required_error: "Tipe promosi wajib dipilih",
    }),
    value: z.number().positive("Nilai promosi harus positif").optional(),
    currency: z.string().optional(),
    startsAt: z.string().optional().or(z.literal("")),
    endsAt: z.string().optional().or(z.literal("")),
    isActive: z.boolean().optional().default(true),
    minSubtotal: z.number().positive("Minimal subtotal harus positif").optional(),
    usageLimit: z.number().int().positive("Batas penggunaan harus positif").optional(),
    usageLimitPerCustomer: z.number().int().positive().optional(),
    productIds: z.array(z.string()).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type !== "FREE_SHIPPING" && !val.value) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nilai promosi wajib diisi",
        path: ["value"],
      });
    }
    if (val.startsAt && val.endsAt && new Date(val.startsAt) >= new Date(val.endsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal mulai harus sebelum tanggal berakhir",
        path: ["endsAt"],
      });
    }
  });

export type PromotionFormData = z.infer<typeof promotionFormSchema>;
