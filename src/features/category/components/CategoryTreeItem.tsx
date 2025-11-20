import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Plus,
  GripVertical,
} from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { CategoryTreeNode } from "../utils/buildCategoryTree";

interface CategoryTreeItemProps {
  category: CategoryTreeNode;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (id: string) => void;
}

export const CategoryTreeItem = forwardRef<
  HTMLDivElement,
  CategoryTreeItemProps
>(({ category, onEdit, onDelete, onToggleExpand, onAddChild }, ref) => {
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

  return (
    <div className="group" ref={setDropRef}>
      <div
        ref={ref}
        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
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

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{category.name}</h3>
              <Badge
                variant={category.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{category.slug}</p>
            {category.description && (
              <p className="text-sm text-muted-foreground max-w-md truncate">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            ref={setDragRef}
            {...listeners}
            {...attributes}
            className="cursor-grab touch-none"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">
            Pos: {category.position}
          </span>
          <Button variant="ghost" size="sm" onClick={() => onEdit(category.id)}>
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
            onClick={() => onDelete(category.id, category.name)}
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
            />
          ))}
        </div>
      )}
    </div>
  );
});
