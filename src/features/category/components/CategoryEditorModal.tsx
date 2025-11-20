import { useEffect } from "react";
import { Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoriesQuery } from "@/features/category/hooks/useCategoriesQuery";
import { useCategoryForm } from "@/features/category/hooks/useCategoryForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string;
  defaultParentId?: string;
  onSuccess?: () => void;
};

export function CategoryEditorModal({
  open,
  onOpenChange,
  categoryId,
  defaultParentId,
  onSuccess,
}: Props) {
  const { form, onSubmit, isLoading, isEditMode } = useCategoryForm({
    categoryId,
    onSuccess,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = form;

  useEffect(() => {
    if (open && !isEditMode && defaultParentId) {
      setValue("parentId", defaultParentId);
    }
  }, [open, isEditMode, defaultParentId, setValue]);

  const { data: categoriesData } = useCategoriesQuery({
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });
  const categories = categoriesData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>Kelola kategori katalog Anda.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori *</Label>
              <Input id="name" {...register("name")} placeholder="Nama" />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="slug-kategori"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">
                  {errors.slug.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Deskripsi kategori"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent</Label>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined} // null/undefined agar placeholder tampil
                  >
                    <SelectTrigger id="parentId">
                      <SelectValue placeholder="Pilih parent (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Root option dengan value null */}
                      <SelectItem value={null as any}>Root</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.parentId && (
                <p className="text-sm text-destructive">
                  {errors.parentId.message as string}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                {...register("sortOrder", { valueAsNumber: true })}
                min={0}
              />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">
                  {errors.sortOrder.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              {watch("isActive") ? "Active" : "Inactive"}
            </Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isEditMode ? "Simpan" : "Buat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
