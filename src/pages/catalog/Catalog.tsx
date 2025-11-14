import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Package, Search, Plus } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProductsQuery, ProductCard } from "@/features/catalog";
import type { Product } from "@/features/catalog/api/productApi";

export default function Catalog() {
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
    // TODO: Navigate to product detail or edit page
    console.log("Product clicked:", product);
  };

  const handleAddProduct = () => {
    // TODO: Navigate to create product page
    console.log("Add new product");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Catalog</h1>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-400" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

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
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Catalog</h1>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Produk
          </Button>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-1 text-sm text-red-600">
            {(error as any).error?.message || "Terjadi kesalahan saat memuat produk. Silakan coba lagi."}
          </p>
        </div>
      </div>
    );
  }

  const products = data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catalog</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-400" />
        <Input
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {products.length === 0 ? (
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
    </div>
  );
}