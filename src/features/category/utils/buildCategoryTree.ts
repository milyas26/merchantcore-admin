import type { Category } from "../api/categoryApi";

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
  isExpanded?: boolean;
}

  const getPos = (cat: any) => (typeof cat.position === "number" ? cat.position : (cat.sortOrder ?? 0));

  const toTreeNode = (cat: Category, level = 0): CategoryTreeNode => {
    const children = (cat.children || []).map((c) => toTreeNode(c, level + 1));
    return {
      ...cat,
      children,
      level,
      isExpanded: true,
    };
  };

export const buildCategoryTree = (
  categories: Category[]
): CategoryTreeNode[] => {
  if (
    categories.some((c) => Array.isArray(c.children) && c.children.length > 0)
  ) {
    const roots = categories.map((c) => toTreeNode(c, 0));
    const sortByPosition = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => getPos(a) - getPos(b));
      nodes.forEach((n) => n.children.length && sortByPosition(n.children));
    };
    sortByPosition(roots);
    return roots;
  }

  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  categories.forEach((category) => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
      level: 0,
      isExpanded: true,
    });
  });

  categories.forEach((category) => {
    const node = categoryMap.get(category.id)!;
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  const sortByPosition = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach((n) => n.children.length && sortByPosition(n.children));
  };
  sortByPosition(rootCategories);
  return rootCategories;
};

export const flattenCategoryTree = (tree: CategoryTreeNode[]): CategoryTreeNode[] => {
  const result: CategoryTreeNode[] = [];
  const traverse = (nodes: CategoryTreeNode[]) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.isExpanded && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  traverse(tree);
  return result;
};