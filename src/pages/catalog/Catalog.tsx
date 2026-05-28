import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  Plus,
  X,
  Grid3X3,
  List,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductsQuery, ProductCard, ProductDataTable } from "@/features/catalog";
import type { Product } from "@/features/catalog/api/productApi";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "table";

export default function Catalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    error,
  } = useProductsQuery({
    page,
    limit: viewMode === "table" ? 15 : 24,
    search: debouncedSearchTerm || undefined,
    published: true,
    sortBy: sortBy as any,
    sortOrder,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  const handleProductClick = (product: Product) => {
    navigate(`/catalog/${product.slug}`);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "name" ? "asc" : "desc");
    }
  };

  const statsText = pagination
    ? `${pagination.total} produk`
    : "";

  const sortOptions = [
    { label: "Terbaru", value: "createdAt", order: "desc" as const },
    { label: "Terlama", value: "createdAt", order: "asc" as const },
    { label: "Harga ↑", value: "price", order: "asc" as const },
    { label: "Harga ↓", value: "price", order: "desc" as const },
  ];

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {(error as any)?.error?.message ||
            "Gagal memuat katalog. Silakan muat ulang halaman."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Katalog Produk
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola produk dan varian katalog toko Anda
            </p>
          </div>
          {pagination && !isLoading && (
            <Badge variant="secondary" className="h-6 text-xs font-normal">
              {pagination.total} produk
            </Badge>
          )}
        </div>
        <Button onClick={() => navigate("/catalog/new")} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah Produk
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {sortOptions.map((opt) => {
            const isActive = sortBy === opt.value && sortOrder === opt.order;
            return (
              <Badge
                key={`${opt.value}-${opt.order}`}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer h-7 text-xs font-normal hover:bg-muted transition-colors"
                onClick={() => {
                  setSortBy(opt.value);
                  setSortOrder(opt.order);
                  setPage(1);
                }}
              >
                {opt.label}
              </Badge>
            );
          })}
        </div>

        <div className="flex items-center border rounded-lg ml-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-l-lg transition-colors",
              viewMode === "grid"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "p-2 rounded-r-lg transition-colors",
              viewMode === "table"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        viewMode === "table" ? (
          <Card>
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        )
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              {searchTerm ? (
                <Search className="h-8 w-8 text-muted-foreground/60" />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground/60" />
              )}
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {searchTerm
                ? "Produk tidak ditemukan"
                : "Belum ada produk"}
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              {searchTerm
                ? `Tidak ada produk yang cocok dengan "${searchTerm}". Coba kata kunci lain.`
                : "Tambahkan produk pertama Anda untuk mulai berjualan."}
            </p>
            {searchTerm ? (
              <Button
                variant="outline"
                onClick={() => setSearchTerm("")}
              >
                Hapus Pencarian
              </Button>
            ) : (
              <Button onClick={() => navigate("/catalog/new")}>
                <Plus className="h-4 w-4 mr-1.5" />
                Tambah Produk
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "table" && pagination ? (
        <ProductDataTable
          products={products}
          pagination={pagination}
          onProductClick={handleProductClick}
          onPageChange={setPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
