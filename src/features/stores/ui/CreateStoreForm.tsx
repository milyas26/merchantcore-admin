import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createStoreSimpleSchema, type CreateStoreFormData } from "../types/schema"

interface CreateStoreFormProps {
  onSubmit: (data: CreateStoreFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  submitButtonText?: string
  cancelButtonText?: string
}

export function CreateStoreForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = "Create Store",
  cancelButtonText = "Cancel"
}: CreateStoreFormProps) {
  const form = useForm<CreateStoreFormData>({
    resolver: zodResolver(createStoreSimpleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const handleSubmit = async (data: CreateStoreFormData) => {
    await onSubmit(data)
  }

  const handleCancel = () => {
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter store name"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter store description"
                  rows={3}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description for your store
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {cancelButtonText}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  )
}