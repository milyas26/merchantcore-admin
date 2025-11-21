import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Plus,
  GripVertical,
  Loader2,
} from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { CategoryTreeNode } from "../utils/buildCategoryTree";
import { categoryService } from "@/features/category/services/categoryService";
import { generateSlug } from "@/lib/slugUtils";
import { toast } from "sonner";

interface CategoryTreeItemProps {
  category: CategoryTreeNode;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (id: string) => void;
  editingTargetId?: string;
  addChildTargetId?: string;
  onInlineSaved?: () => void;
  onInlineCancel?: () => void;
}

export const CategoryTreeItem = forwardRef<
  HTMLDivElement,
  CategoryTreeItemProps
>(
  (
    {
      category,
      onEdit,
      onDelete,
      onToggleExpand,
      onAddChild,
      editingTargetId,
      addChildTargetId,
      onInlineSaved,
      onInlineCancel,
    },
    ref
  ) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = category.isExpanded ?? true;

    const { setNodeRef: setDropRef, isOver } = useDroppable({
      id: category.id,
    });
    const {
      setNodeRef: setDragRef,
      listeners,
      attributes,
      transform,
    } = useDraggable({ id: category.id });

    const handleToggle = () => {
      if (hasChildren) {
        onToggleExpand(category.id);
      }
    };

    const [editValue, setEditValue] = useState(category.name);
    const [savingEdit, setSavingEdit] = useState(false);
    const [errorEdit, setErrorEdit] = useState("");
    const editInputRef = useRef<HTMLInputElement | null>(null);

    const isEditing = editingTargetId === category.id;
    const isAddingChild = addChildTargetId === category.id;

    useEffect(() => {
      if (isEditing) {
        setEditValue(category.name);
      }
    }, [isEditing, category.name]);

    const validateName = (name: string) => {
      if (!name.trim()) return "Nama kategori wajib diisi";
      if (name.trim().length > 255)
        return "Nama kategori maksimal 255 karakter";
      return "";
    };

    const saveEdit = async () => {
      if (savingEdit) return;
      const msg = validateName(editValue);
      if (msg) {
        setErrorEdit(msg);
        return;
      }
      setErrorEdit("");
      setSavingEdit(true);
      try {
        const slug = generateSlug(editValue);
        await categoryService.updateCategory(category.id, {
          name: editValue.trim(),
          slug,
        });
        toast.success("Kategori diperbarui");
        onInlineSaved?.();
      } catch (e: any) {
        const errMsg = e?.error?.message || "Gagal menyimpan kategori";
        toast.error(errMsg);
        setErrorEdit(errMsg);
      } finally {
        setSavingEdit(false);
      }
    };

    const [childValue, setChildValue] = useState("");
    const [savingChild, setSavingChild] = useState(false);
    const [errorChild, setErrorChild] = useState("");
    const childInputRef = useRef<HTMLInputElement | null>(null);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteDialog = () => setIsDeleteOpen(true);
    const closeDeleteDialog = () => setIsDeleteOpen(false);

    const confirmDelete = async () => {
      if (isDeleting) return;
      setIsDeleting(true);
      try {
        await categoryService.deleteCategory(category.id);
        toast.success(`Kategori "${category.name}" dihapus`);
        onInlineSaved?.();
        setIsDeleteOpen(false);
      } catch (e: any) {
        const errMsg = e?.error?.message || "Gagal menghapus kategori";
        toast.error(errMsg);
        setIsDeleteOpen(false);
      } finally {
        setIsDeleting(false);
      }
    };

    const saveChild = async () => {
      if (savingChild) return;
      const msg = validateName(childValue);
      if (msg) {
        setErrorChild(msg);
        return;
      }
      setErrorChild("");
      setSavingChild(true);
      try {
        const slug = generateSlug(childValue);
        await categoryService.createCategory({
          name: childValue.trim(),
          slug,
          parentId: category.id,
        });
        toast.success("Sub-kategori ditambahkan");
        onInlineSaved?.();
        setChildValue("");
      } catch (e: any) {
        const errMsg = e?.error?.message || "Gagal menambahkan sub-kategori";
        toast.error(errMsg);
        setErrorChild(errMsg);
      } finally {
        setSavingChild(false);
      }
    };

    return (
      <div ref={setDropRef}>
        <div
          ref={ref}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group"
          style={{
            marginLeft: `${category.level * 24}px`,
            backgroundColor: isOver ? "rgba(0,0,0,0.04)" : undefined,
            transform: transform
              ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
              : undefined,
          }}
        >
          <div className="flex items-center space-x-3 flex-1">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleToggle}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}

            <div
              ref={setDragRef}
              {...listeners}
              {...attributes}
              className="cursor-grab touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={editInputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveEdit();
                        } else if (e.key === "Escape") {
                          onInlineCancel?.();
                        }
                      }}
                      onBlur={saveEdit}
                      autoFocus
                      placeholder="Nama kategori"
                      className="h-8"
                    />
                    {savingEdit && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {errorEdit && (
                    <p className="text-xs text-destructive">{errorEdit}</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <Badge
                      variant={category.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.slug}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(category.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={openDeleteDialog}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {category.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleExpand={onToggleExpand}
                onAddChild={onAddChild}
                editingTargetId={editingTargetId}
                addChildTargetId={addChildTargetId}
                onInlineSaved={onInlineSaved}
                onInlineCancel={onInlineCancel}
              />
            ))}
          </div>
        )}

        {isAddingChild && (
          <div
            className="mt-1"
            style={{ marginLeft: `${(category.level + 1) * 24}px` }}
          >
            <div className="flex items-center gap-2">
              <Input
                ref={childInputRef}
                value={childValue}
                onChange={(e) => setChildValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveChild();
                  } else if (e.key === "Escape") {
                    onInlineCancel?.();
                  }
                }}
                onBlur={saveChild}
                autoFocus
                placeholder="Nama sub-kategori"
                className="h-8"
              />
              {savingChild && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          {errorChild && (
            <p className="text-xs text-destructive">{errorChild}</p>
          )}
          </div>
        )}

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus kategori ini?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} onClick={closeDeleteDialog}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </span>
                ) : (
                  "Hapus"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
);
