import { z } from "zod";

export const announcementFormSchema = z
  .object({
    title: z.string().min(1, "Judul pengumuman wajib diisi").max(255),
    description: z.string().optional(),
    link: z.string().url("Link tidak valid").optional().or(z.literal("")),
    type: z.enum(["INFO", "WARNING", "PROMO", "MAINTENANCE"], {
      required_error: "Tipe pengumuman wajib dipilih",
    }).optional().default("INFO"),
    isActive: z.boolean().optional().default(true),
    startsAt: z.string().optional().or(z.literal("")),
    endsAt: z.string().optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (val.startsAt && val.endsAt && new Date(val.startsAt) >= new Date(val.endsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal mulai harus sebelum tanggal berakhir",
        path: ["endsAt"],
      });
    }
  });

export type AnnouncementFormData = z.infer<typeof announcementFormSchema>;
