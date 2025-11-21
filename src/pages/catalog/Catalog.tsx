import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Package, Search, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProductsQuery, ProductCard } from "@/features/catalog";
import type { Product } from "@/features/catalog/api/productApi";

export default function Catalog() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useProductsQuery({
    page: 1,
    limit: 12,
    search: debouncedSearchTerm || undefined,
    published: true,
  });

  const handleProductClick = (product: Product) => {
    navigate(`/catalog/${product.slug}`);
  };

  const handleAddProduct = () => {
    // Navigate to create product page
    navigate("/catalog/new");
  };

  const products = data?.data || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle>Catalog</CardTitle>
              <CardDescription>
                Kelola katalog produk dan informasi produk.
              </CardDescription>
            </div>
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {(error as any).error?.message ||
                  "Terjadi kesalahan saat memuat produk. Silakan coba lagi."}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardHeader className="p-4 pb-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-full mt-1" />
                    <Skeleton className="h-4 w-full mt-1" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Belum ada produk
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Mulai tambahkan produk ke katalog Anda untuk memulai penjualan.
                </p>
                <Button onClick={handleAddProduct}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={handleProductClick}
                />
              ))}
            </div>
          )}

          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <p className="text-sm text-gray-600">
                Menampilkan {products.length} dari {data.pagination.total} produk
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}