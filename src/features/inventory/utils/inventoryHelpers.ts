export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reserved: number;
};

export const LOW_STOCK_THRESHOLD = 5;

export function computeLowStock(stock: number, reserved: number): boolean {
  return stock - reserved <= LOW_STOCK_THRESHOLD;
}

export function validateChanges(values: {
  name: string;
  sku: string;
  stock: number;
  reserved: number;
}) {
  const errors: Partial<Record<keyof typeof values, string>> = {};
  if (!values.name.trim()) errors.name = "Nama produk wajib diisi";
  if (!values.sku.trim()) errors.sku = "SKU wajib diisi";
  if (!Number.isFinite(values.stock) || values.stock < 0)
    errors.stock = "Stock tidak boleh negatif";
  if (!Number.isFinite(values.reserved) || values.reserved < 0)
    errors.reserved = "Reserved tidak boleh negatif";
  if (!errors.stock && !errors.reserved && values.reserved > values.stock)
    errors.reserved = "Reserved tidak boleh melebihi stock";
  return { isValid: Object.keys(errors).length === 0, errors };
}

export function applyItemUpdate(
  items: InventoryItem[],
  id: string,
  next: { name: string; sku: string; stock: number; reserved: number }
) {
  return items.map((it) => (it.id === id ? { ...it, ...next } : it));
}