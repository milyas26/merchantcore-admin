import { z } from "zod"

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Phone must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters")
    .optional()
    .or(z.literal("")),
})

export const createStoreSimpleSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Store name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
})

export type CreateStoreFormData = z.infer<typeof createStoreSimpleSchema>