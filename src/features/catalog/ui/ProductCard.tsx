import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Product } from "../api/productApi";
import { ShoppingBag, Package, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const mainImage = product.media?.[0];
  const hasVariants = product.variants && product.variants.length > 0;
  const inStock = hasVariants 
    ? product.variants!.some(variant => 
        !product.trackInventory || 
        (variant.inventory && variant.inventory.quantity > variant.inventory.reserved)
      )
    : true;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getLowestVariantPrice = () => {
    if (!hasVariants) return product.basePrice;
    
    const variantPrices = product.variants!.map(v => v.price);
    return Math.min(...variantPrices);
  };

  const displayPrice = getLowestVariantPrice();

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer",
        !product.isActive && "opacity-60"
      )}
      onClick={() => onClick?.(product)}
    >
      <div className="aspect-square relative bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {!inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black px-2 py-1 rounded">
              Stok Habis
            </span>
          </div>
        )}
        
        {product.isFeatured && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
        
        {!product.isActive && (
          <div className="absolute top-2 right-2">
            <span className="bg-gray-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Draft
            </span>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="space-y-1">
          {product.category && (
            <p className="text-xs text-gray-500 font-medium">
              {product.category.name}
            </p>
          )}
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(displayPrice)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ShoppingBag className="w-4 h-4" />
            {hasVariants ? (
              <span>{product.variants!.length} varian</span>
            ) : (
              <span>1 varian</span>
            )}
          </div>
        </div>
        
        {product.sku && (
          <div className="mt-2 text-xs text-gray-500">
            SKU: {product.sku}
          </div>
        )}
        
        {product.trackInventory && hasVariants && (
          <div className="mt-2 text-xs">
            {product.variants!.map((variant) => (
              <div key={variant.id} className="flex justify-between">
                <span className="text-gray-600">{variant.title}</span>
                <span className={cn(
                  "font-medium",
                  variant.inventory && variant.inventory.quantity > variant.inventory.reserved
                    ? "text-green-600"
                    : "text-red-600"
                )}>
                  {variant.inventory 
                    ? variant.inventory.quantity - variant.inventory.reserved
                    : 0
                  } tersedia
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}