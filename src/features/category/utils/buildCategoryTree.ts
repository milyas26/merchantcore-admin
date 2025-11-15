import type { Category } from "../api/categoryApi";

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
  isExpanded?: boolean;
}

export const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // First pass: create nodes and build map
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
      level: 0,
      isExpanded: true
    });
  });

  // Second pass: build parent-child relationships
  categories.forEach(category => {
    const node = categoryMap.get(category.id)!;
    
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        // If parent doesn't exist in the list, treat as root
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  // Sort categories by position within each level
  const sortByPosition = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortByPosition(node.children);
      }
    });
  };

  sortByPosition(rootCategories);

  return rootCategories;
};

export const flattenCategoryTree = (tree: CategoryTreeNode[]): CategoryTreeNode[] => {
  const result: CategoryTreeNode[] = [];
  
  const traverse = (nodes: CategoryTreeNode[]) => {
    nodes.forEach(node => {
      result.push(node);
      if (node.isExpanded && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  
  traverse(tree);
  return result;
};