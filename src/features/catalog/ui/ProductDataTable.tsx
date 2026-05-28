import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "../api/productApi";
import { Package, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDataTableProps {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onProductClick: (product: Product) => void;
  onPageChange: (page: number) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string) => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

export function ProductDataTable({
  products,
  pagination,
  onProductClick,
  onPageChange,
  sortBy = "createdAt",
  sortOrder = "desc",
  onSort,
}: ProductDataTableProps) {
  const handleSort = (column: string) => {
    onSort?.(column);
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return (
      <ArrowUpDown className="ml-1 h-3.5 w-3.5 inline" />
    );
  };

  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Card className="px-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead className="min-w-[200px]">
                <button
                  type="button"
                  className="flex items-center hover:text-foreground transition-colors"
                  onClick={() => handleSort("name")}
                >
                  Produk {renderSortIcon("name")}
                </button>
              </TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">
                <button
                  type="button"
                  className="flex items-center ml-auto hover:text-foreground transition-colors"
                  onClick={() => handleSort("price")}
                >
                  Harga {renderSortIcon("price")}
                </button>
              </TableHead>
              <TableHead className="text-center">Stok</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, idx) => {
              const variantCount = product.variants?.length ?? 0;
              const hasVariants = variantCount > 1;

              const totalStock = product.trackInventory
                ? (product.variants ?? []).reduce(
                    (s, v) => s + (v.inventory?.quantity ?? 0),
                    0
                  )
                : null;

              const lowStock =
                totalStock !== null &&
                totalStock > 0 &&
                product.variants?.some(
                  (v) =>
                    v.inventory &&
                    v.inventory.lowStockThreshold &&
                    v.inventory.quantity <= v.inventory.lowStockThreshold
                );

              const outOfStock = totalStock !== null && totalStock <= 0;

              return (
                <TableRow
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {(pagination.page - 1) * pagination.limit + idx + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.images?.[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate max-w-[180px]">
                          {product.name}
                        </p>
                        {hasVariants && (
                          <p className="text-xs text-muted-foreground">
                            {variantCount} varian
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {product.category?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm font-mono">
                    {product.sku ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-sm">
                        {formatPrice(product.basePrice)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {totalStock === null ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : outOfStock ? (
                      <Badge
                        variant="destructive"
                        className="text-[10px] h-5"
                      >
                        Habis
                      </Badge>
                    ) : (
                      <span
                        className={cn(
                          "text-sm font-medium",
                          lowStock
                            ? "text-amber-600"
                            : "text-green-600"
                        )}
                      >
                        {totalStock}
                        {lowStock && (
                          <span className="text-[10px] block">stok rendah</span>
                        )}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.isActive ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-[10px] h-5 border-0"
                      >
                        Aktif
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-600 text-[10px] h-5 border-0"
                      >
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            {pagination.total} produk
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!pagination.hasPrev}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="w-8 text-center text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => onPageChange(page as number)}
                  className="text-xs"
                >
                  {page}
                </Button>
              )
            )}

            <Button
              variant="outline"
              size="icon-sm"
              disabled={!pagination.hasNext}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
