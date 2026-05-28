import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Search, X, Package, Check } from "lucide-react";
import { useProductsQuery } from "@/features/catalog";
import type { Product } from "@/features/catalog/api/productApi";
import { cn } from "@/lib/utils";

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
}

const formatPrice = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

export function ProductPickerModal({ open, onOpenChange, selectedIds, onSelect }: ProductPickerModalProps) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [pending, setPending] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setPending([...selectedIds]);
      setSearch("");
    }
  }, [open, selectedIds]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useProductsQuery({
    page: 1, limit: 100,
    search: debounced || undefined,
    sortBy: "name", sortOrder: "asc",
  });

  const products = data?.data || [];

  const toggleProduct = (id: string) => {
    setPending((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onSelect(pending);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pilih Produk
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto border rounded-lg -mx-0 mt-2">
          {isLoading ? (
            <div className="p-2 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">{debounced ? "Produk tidak ditemukan" : "Tidak ada produk"}</p>
            </div>
          ) : (
            <div>
              {products.map((product) => {
                const isSelected = pending.includes(product.id);
                const image = product.images?.[0];
                const variantCount = product.variants?.length ?? 0;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                    )}>
                      {isSelected && <Check className="h-3 w-3" strokeWidth={4} />}
                    </div>
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {image?.url ? (
                        <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sku || "—"}
                        {variantCount > 1 && <span className="ml-2">({variantCount} SKU)</span>}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">{formatPrice(product.basePrice)}</p>
                      {product.isFeatured && (
                        <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-amber-400/20 text-amber-700 border-0">Unggulan</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center gap-2 sm:justify-between mt-3">
          <p className="text-xs text-muted-foreground">{pending.length} produk dipilih</p>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm">Batal</Button>
            </DialogClose>
            <Button size="sm" onClick={handleConfirm}>
              Pilih ({pending.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
