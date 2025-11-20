import { useCallback, useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { CategoryTreeItem } from "./CategoryTreeItem";
import { buildCategoryTree, flattenCategoryTree, type CategoryTreeNode } from "../utils/buildCategoryTree";
import type { Category } from "../api/categoryApi";

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onAddChild: (id: string) => void;
  onMoveCategory?: (params: { id: string; newParentId: string | null }) => void;
}

export function CategoryTreeView({ categories, onEdit, onDelete, onAddChild, onMoveCategory }: CategoryTreeViewProps) {
  const [treeData, setTreeData] = useState(() => buildCategoryTree(categories));
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setTreeData(buildCategoryTree(categories));
  }, [categories]);

  const handleToggleExpand = (categoryId: string) => {
    const updateExpandedState = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      return nodes.map(node => {
        if (node.id === categoryId) {
          return {
            ...node,
            isExpanded: !node.isExpanded
          };
        }
        if (node.children.length > 0) {
          return {
            ...node,
            children: updateExpandedState(node.children)
          };
        }
        return node;
      });
    };

    setTreeData(updateExpandedState(treeData));
  };

  const visibleCategories = flattenCategoryTree(treeData);

  const findNodeById = useCallback((nodes: CategoryTreeNode[], id: string): CategoryTreeNode | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const found = findNodeById(n.children, id);
      if (found) return found;
    }
    return null;
  }, []);

  const isDescendant = useCallback((parentId: string, possibleChildId: string): boolean => {
    const parent = findNodeById(treeData, parentId);
    if (!parent) return false;
    const stack = [...parent.children];
    while (stack.length) {
      const c = stack.pop()!;
      if (c.id === possibleChildId) return true;
      stack.push(...c.children);
    }
    return false;
  }, [treeData, findNodeById]);

  const moveInState = useCallback(
    (id: string, newParentId: string | null) => {
      const draft = structuredClone(treeData) as CategoryTreeNode[];

      // Remove from root list if present
      const rootIdx = draft.findIndex((r) => r.id === id);
      let movedNode: CategoryTreeNode | undefined;
      if (rootIdx >= 0) {
        [movedNode] = draft.splice(rootIdx, 1);
      }

      // Remove from any parent children if not already removed
      const removeFromChildren = (nodes: CategoryTreeNode[]): boolean => {
        for (const n of nodes) {
          const idx = n.children.findIndex((c) => c.id === id);
          if (idx >= 0) {
            [movedNode] = n.children.splice(idx, 1);
            return true;
          }
          if (removeFromChildren(n.children)) return true;
        }
        return false;
      };
      if (!movedNode) removeFromChildren(draft);

      // Fallback: locate node if still not found
      if (!movedNode) movedNode = findNodeById(draft, id) ?? undefined;
      if (!movedNode) return draft;

      // Attach to new parent or root
      if (newParentId) {
        const parent = findNodeById(draft, newParentId);
        if (!parent) return draft;
        movedNode.parentId = parent.id as any;
        movedNode.level = parent.level + 1;
        parent.children.push(movedNode);
      } else {
        movedNode.parentId = null as any;
        movedNode.level = 0;
        draft.push(movedNode);
      }

      return draft;
    },
    [treeData, findNodeById]
  );

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;
      if (!over) return;
      const activeId: string = active.id;
      const overId: string = over.id;
      if (activeId === overId) return;

      if (isDescendant(activeId, overId)) return;

      const next = moveInState(activeId, overId === "root" ? null : overId);
      setTreeData(next);
      onMoveCategory?.({
        id: activeId,
        newParentId: overId === "root" ? null : overId,
      });
    },
    [isDescendant, moveInState, onMoveCategory]
  );

  const rootDropHint = useMemo(() => (
    (() => {
      const RootDropZone = () => {
        const { setNodeRef, isOver } = useDroppable({ id: "root" });
        return (
          <div
            ref={setNodeRef}
            className="mb-2 p-2 border border-dashed rounded text-center text-xs"
            style={{
              backgroundColor: isOver ? "rgba(0,0,0,0.04)" : undefined,
              color: "var(--muted-foreground)"
            }}
          >
            Drop di sini untuk jadikan Root
          </div>
        );
      };
      return <RootDropZone />;
    })()
  ), []);

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      {visibleCategories.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No categories found.</div>
      ) : (
        <div className="space-y-2">
          {rootDropHint}
          {treeData.map(category => (
            <CategoryTreeItem
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleExpand={handleToggleExpand}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </DndContext>
  );
}