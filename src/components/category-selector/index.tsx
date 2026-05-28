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
import { Badge } from "@/components/ui/badge";
import { useCategoriesQuery } from "@/features/category/hooks/useCategoriesQuery";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import {
  buildCategoryTree,
  type CategoryTreeNode,
} from "@/features/category/utils/buildCategoryTree";
import type { Category } from "@/features/category/api/categoryApi";
import { cn } from "@/lib/utils";

const CategorySelector = ({
  onSaveSelect,
  defaultValue,
}: {
  onSaveSelect: (id: string) => void;
  defaultValue?: string;
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);
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
      setSelectedId(defaultValue);
    }
  }, [defaultValue]);

  const handleToggleExpand = (categoryId: string) => {
    setTreeData((prev) =>
      prev.map((node) => toggleNode(node, categoryId))
    );
  };

  const toggleNode = (node: CategoryTreeNode, targetId: string): CategoryTreeNode => {
    if (node.id === targetId) {
      return { ...node, isExpanded: !node.isExpanded };
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: node.children.map((child) => toggleNode(child, targetId)),
      };
    }
    return node;
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

  const findPath = React.useCallback(
    (nodes: CategoryTreeNode[], id: string): CategoryTreeNode[] => {
      for (const n of nodes) {
        if (n.id === id) return [n];
        const found = findPath(n.children, id);
        if (found.length > 0) return [n, ...found];
      }
      return [];
    },
    []
  );

  const selectedName = React.useMemo(() => {
    if (!selectedId) return null;
    return findNodeById(treeData, selectedId)?.name ?? null;
  }, [selectedId, treeData, findNodeById]);

  const selectedPath = React.useMemo(() => {
    if (!selectedId) return [];
    return findPath(treeData, selectedId);
  }, [selectedId, treeData, findPath]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleSubmit = () => {
    onSaveSelect(selectedId ?? "");
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedId(null);
    onSaveSelect("");
    setOpen(false);
  };

  const CategoryRow = ({ node }: { node: CategoryTreeNode }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = node.isExpanded ?? true;
    const isSelected = selectedId === node.id;

    return (
      <div>
        <div
          className={cn(
            "flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer transition-colors group",
            isSelected
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-muted"
          )}
          style={{ paddingLeft: `${node.level * 20 + 8}px` }}
          onClick={() => handleSelect(node.id)}
          role="radio"
          aria-checked={isSelected}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSelect(node.id);
            }
          }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(node.id);
              }}
              className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-5 flex-shrink-0" />
          )}

          <span
            className={cn(
              "flex-shrink-0",
              isSelected ? "text-primary" : "text-muted-foreground"
            )}
          >
            {isSelected || isExpanded ? (
              <FolderOpen className="h-4 w-4" />
            ) : (
              <Folder className="h-4 w-4" />
            )}
          </span>

          <span className="text-sm truncate flex-1">{node.name}</span>

          {hasChildren && (
            <Badge
              variant="secondary"
              className="text-[10px] h-4 px-1.5 font-normal opacity-60 group-hover:opacity-100 transition-opacity"
            >
              {node.children.length}
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child) => (
              <CategoryRow key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-9 font-normal"
        >
          <span className="flex items-center gap-2 truncate">
            <Folder
              className={cn(
                "h-4 w-4 flex-shrink-0",
                selectedId ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span
              className={cn(
                "truncate",
                !selectedId && "text-muted-foreground"
              )}
            >
              {selectedName ?? "Pilih Kategori"}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Pilih Kategori
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-8"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {selectedPath.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground px-1">
              <span>Terpilih:</span>
              {selectedPath.map((node, i) => (
                <React.Fragment key={node.id}>
                  {i > 0 && (
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      "truncate max-w-[120px]",
                      i === selectedPath.length - 1 && "text-foreground font-medium"
                    )}
                  >
                    {node.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="border rounded-lg max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-2 space-y-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-2 px-2"
                    style={{ paddingLeft: `${(i % 3) * 20 + 8}px` }}
                  >
                    <div className="w-5 h-5" />
                    <div className="animate-pulse bg-muted h-3.5 w-5 rounded flex-shrink-0" />
                    <div
                      className="animate-pulse bg-muted h-3.5 rounded"
                      style={{
                        width: `${60 + Math.random() * 30}%`,
                        maxWidth: "180px",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : treeData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Folder className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "Kategori tidak ditemukan"
                    : "Belum ada kategori"}
                </p>
                {searchTerm && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="mt-1 h-auto p-0"
                  >
                    Hapus pencarian
                  </Button>
                )}
              </div>
            ) : (
              <div className="py-1">
                {treeData.map((root) => (
                  <CategoryRow key={root.id} node={root} />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!selectedId}
            className="text-muted-foreground"
          >
            Hapus Pilihan
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Batal
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} size="sm">
              Pilih
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySelector;
