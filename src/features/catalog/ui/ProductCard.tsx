import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "../api/productApi";
import { Package, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const getPriceRange = (product: Product) => {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    return { min: product.basePrice, max: product.basePrice, hasRange: false };
  }
  const prices = variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, hasRange: min !== max };
};

const getTotalStock = (product: Product) => {
  if (!product.trackInventory) return null;
  const variants = product.variants ?? [];
  return variants.reduce((sum, v) => sum + (v.inventory?.quantity ?? 0), 0);
};

export function ProductCard({ product, onClick }: ProductCardProps) {
  const mainImage = product.images?.[0];
  const variantCount = product.variants?.length ?? 0;
  const { min: minPrice, max: maxPrice, hasRange } = getPriceRange(product);
  const totalStock = getTotalStock(product);

  return (
    <Card
      className={cn(
        "group overflow-hidden border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        !product.isActive && "opacity-75"
      )}
      onClick={() => onClick?.(product)}
    >
      <div className="aspect-square relative bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
        {mainImage?.url ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const fallback = (e.target as HTMLImageElement).nextElementSibling;
              if (fallback) (fallback as HTMLElement).classList.remove("hidden");
            }}
          />
        ) : null}
        {(!mainImage?.url || true) && (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center",
              mainImage?.url && "hidden"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Package className="w-12 h-12 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground font-medium">
                No Image
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          {!product.isActive && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-gray-800/80 text-white border-0">
              Draft
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="text-[10px] h-5 px-1.5 bg-amber-400 text-amber-900 border-0">
              Unggulan
            </Badge>
          )}
        </div>

        {totalStock !== null && totalStock <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="destructive" className="text-xs font-semibold">
              Stok Habis
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3">
        {product.category && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
            {product.category.name}
          </p>
        )}

        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-foreground">
            {formatPrice(minPrice)}
          </span>
          {hasRange && (
            <span className="text-[10px] text-muted-foreground">
              &ndash; {formatPrice(maxPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>
              {variantCount > 0 ? `${variantCount} SKU` : "1 SKU"}
            </span>
          </div>
          {totalStock !== null && (
            <span
              className={cn(
                "font-medium",
                totalStock > 0 ? "text-green-600" : "text-destructive"
              )}
            >
              {totalStock > 0 ? `${totalStock} stok` : "Habis"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
