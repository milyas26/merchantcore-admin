import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Product } from "../api/productApi";
import { productApi } from "../api/productApi";
import { Package, Layers, MoreVertical, Eye, Pencil, Archive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const mainImage = product.images?.[0];
  const variantCount = product.variants?.length ?? 0;
  const { min: minPrice, max: maxPrice, hasRange } = getPriceRange(product);
  const totalStock = getTotalStock(product);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productApi.deleteProduct(product.id);
      toast.success("Produk berhasil dihapus");
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.error?.message || "Gagal menghapus produk");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await productApi.updateProductStatus(product.id, !product.isActive);
      toast.success(product.isActive ? "Produk diarsipkan" : "Produk diaktifkan");
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.error?.message || "Gagal mengubah status produk");
    }
  };

  return (
    <>
      <Card
        className={cn(
          "group overflow-hidden border transition-all py-0 duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
          !product.isActive && "opacity-75"
        )}
        onClick={() => onClick?.(product)}
      >
        <div className="aspect-square relative bg-linear-to-br from-muted/50 to-muted overflow-hidden">
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

          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/catalog/${product.slug}`);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/catalog/edit/${product.slug}`);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  {product.isActive ? "Arsipkan" : "Aktifkan"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus "{product.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
