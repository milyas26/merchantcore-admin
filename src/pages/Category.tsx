import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCategoriesQuery } from "@/features/category/hooks/useCategoriesQuery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Plus, Search } from "lucide-react";
import { useState } from "react";
import { categoryService } from "@/features/category/services/categoryService";
import { toast } from "sonner";
import { CategoryTreeView } from "@/features/category/components/CategoryTreeView";

export default function Category() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inlineEditId, setInlineEditId] = useState<string | undefined>(
    undefined
  );
  const [inlineChildParentId, setInlineChildParentId] = useState<string | undefined>(
    undefined
  );
  const [inlineRootRequested, setInlineRootRequested] = useState(false);
  const { data, isLoading, error, refetch } = useCategoriesQuery({
    search: searchTerm || undefined,
    limit: 50,
    sortBy: "name",
    sortOrder: "asc",
  });

  const categories = data?.data || [];

  const handleCreateCategory = () => {
    setInlineEditId(undefined);
    setInlineChildParentId(undefined);
    setInlineRootRequested(true);
  };

  const handleEditCategory = (id: string) => {
    setInlineEditId(id);
    setInlineChildParentId(undefined);
    setInlineRootRequested(false);
  };

  const handleAddChild = (parentId: string) => {
    setInlineEditId(undefined);
    setInlineChildParentId(parentId);
    setInlineRootRequested(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await categoryService.deleteCategory(id);
        toast.success(`Category "${name}" deleted successfully`);
      } catch (error) {
        toast.error("Failed to delete category");
        console.error("Delete error:", error);
      }
    }
  };

  const handleMoveCategory = async ({
    id,
    newParentId,
  }: {
    id: string;
    newParentId: string | null;
  }) => {
    try {
      await categoryService.moveCategory(id, {
        parentId: newParentId ?? undefined,
      });
      toast.success("Kategori dipindahkan");
    } catch (error) {
      toast.error("Gagal memindahkan kategori");
      console.error("Move error:", error);
    }
  };

  const clearInlineState = () => {
    setInlineEditId(undefined);
    setInlineChildParentId(undefined);
    setInlineRootRequested(false);
  };

  const handleInlineSaved = () => {
    clearInlineState();
    refetch();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Category</CardTitle>
              <CardDescription>
                Manage your category catalog, categories, and category
                information.
              </CardDescription>
            </div>
            <Button onClick={handleCreateCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load categories. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <CategoryTreeView
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onAddChild={handleAddChild}
              onMoveCategory={handleMoveCategory}
              editingId={inlineEditId}
              addChildParentId={inlineChildParentId}
              addRootRequested={inlineRootRequested}
              onInlineSaved={handleInlineSaved}
              onInlineCancel={clearInlineState}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
