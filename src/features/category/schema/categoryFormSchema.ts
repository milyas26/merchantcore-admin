import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(255, "Category name must be less than 255 characters"),
  slug: z.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0, "Sort order must be positive").optional().default(0),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;