import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategoriesQuery } from "@/features/category/hooks/useCategoriesQuery";
import { ChevronRight, ChevronDown } from "lucide-react";
import {
  buildCategoryTree,
  type CategoryTreeNode,
} from "@/features/category/utils/buildCategoryTree";
import type { Category } from "@/features/category/api/categoryApi";

const CategorySelector = ({
  onSaveSelect,
  defaultValue,
}: {
  onSaveSelect: (id: string) => void;
  defaultValue?: string;
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const { data, isLoading } = useCategoriesQuery({
    search: searchTerm || undefined,
    limit: 50,
    sortBy: "name",
    sortOrder: "asc",
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [treeData, setTreeData] = React.useState<CategoryTreeNode[]>([]);

  React.useEffect(() => {
    const categories: Category[] = data?.data ?? [];
    setTreeData(buildCategoryTree(categories));
  }, [data]);

  React.useEffect(() => {
    if (defaultValue) {
      setSelectedId((prev) => (prev == null ? defaultValue : prev));
    }
  }, [defaultValue]);

  const handleToggleExpand = (categoryId: string) => {
    const updateExpandedState = (
      nodes: CategoryTreeNode[]
    ): CategoryTreeNode[] => {
      return nodes.map((node) => {
        if (node.id === categoryId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateExpandedState(node.children) };
        }
        return node;
      });
    };
    setTreeData((prev) => updateExpandedState(prev));
  };

  const findNodeById = React.useCallback(
    (nodes: CategoryTreeNode[], id: string): CategoryTreeNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        const found = findNodeById(n.children, id);
        if (found) return found;
      }
      return null;
    },
    []
  );

  const selectedName = React.useMemo(() => {
    if (!selectedId) return "Pilih Kategori";
    const found = findNodeById(treeData, selectedId);
    return found?.name ?? "Pilih Kategori";
  }, [selectedId, treeData, findNodeById]);

  const onSubmit = () => {
    onSaveSelect(selectedId ?? "");
  };

  const TreeItem: React.FC<{ node: CategoryTreeNode }> = ({ node }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = node.isExpanded ?? true;
    return (
      <div className="space-y-1">
        <div
          className="flex items-center gap-2 py-1"
          style={{ marginLeft: `${node.level * 16}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleToggleExpand(node.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </Button>
          )}
          <Input
            id={`category-${node.id}`}
            type="radio"
            name="category"
            value={node.id}
            checked={selectedId === node.id}
            onChange={() => setSelectedId(node.id)}
            className="w-4 h-4"
          />
          <Label htmlFor={`category-${node.id}`} className="cursor-pointer">
            {node.name}
          </Label>
        </div>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children.map((child) => (
              <TreeItem key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedName}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Pilih Kategori</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Cari Kategori</Label>
            <Input
              id="search"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse bg-muted h-4 w-full rounded-md"></div>
              <div className="animate-pulse bg-muted h-4 w-full rounded-md"></div>
              <div className="animate-pulse bg-muted h-4 w-full rounded-md"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {treeData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada kategori.
                </div>
              ) : (
                treeData.map((root) => <TreeItem key={root.id} node={root} />)
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={onSubmit}>Simpan</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySelector;
