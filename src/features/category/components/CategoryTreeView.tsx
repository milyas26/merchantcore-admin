import { useState } from "react";
import { CategoryTreeItem } from "./CategoryTreeItem";
import { buildCategoryTree, flattenCategoryTree, type CategoryTreeNode } from "../utils/buildCategoryTree";
import type { Category } from "../api/categoryApi";

interface CategoryTreeViewProps {
  categories: Category[];
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export function CategoryTreeView({ categories, onEdit, onDelete }: CategoryTreeViewProps) {
  const [treeData, setTreeData] = useState(() => buildCategoryTree(categories));

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

  // Flatten the tree for rendering only visible nodes
  const visibleCategories = flattenCategoryTree(treeData);

  if (visibleCategories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories found.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {treeData.map(category => (
        <CategoryTreeItem
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
}