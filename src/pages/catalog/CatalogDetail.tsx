import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduk } from "@/features/catalog/hooks/useProductForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Pencil,
  Package,
  Layers,
  Image as ImageIcon,
  Tag,
  Globe,
} from "lucide-react";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const formatNumber = (n: number) =>
  new Intl.NumberFormat("id-ID").format(n);

export default function CatalogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduk(slug as string),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {(error as Error)?.message || "Gagal memuat detail produk"}
        </AlertDescription>
      </Alert>
    );
  }

  const mainImage = product.images?.[0];
  const variantCount = product.variants?.length ?? 0;
  const totalStock = product.trackInventory
    ? (product.variants ?? []).reduce((s, v) => s + (v.inventory?.quantity ?? 0), 0)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/catalog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Aktif" : "Draft"}
              </Badge>
              {product.isFeatured && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-0">
                  Unggulan
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                SKU: {product.sku || "—"}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/catalog/edit/${product.slug}`)}>
          <Pencil className="h-4 w-4 mr-1.5" />
          Edit Produk
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Product Image */}
          <Card className="p-0">
            <CardContent className="p-0">
              <div className="aspect-square relative bg-muted rounded-xl overflow-hidden">
                {mainImage?.url ? (
                  <img
                    src={mainImage.url}
                    alt={mainImage.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Images */}
          {(product.images?.length ?? 0) > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Gambar Lainnya</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {product.images?.slice(1).map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square rounded-md bg-muted overflow-hidden"
                    >
                      <img
                        src={img.url}
                        alt={img.alt || ""}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Informasi Produk</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Deskripsi
                  </p>
                  <p className="text-sm leading-relaxed">{product.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Kategori
                  </p>
                  <p className="text-sm font-medium">
                    {product.category?.name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Harga Jual
                  </p>
                  <p className="text-sm font-bold text-lg">
                    {formatPrice(product.basePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    HPP
                  </p>
                  <p className="text-sm font-medium">
                    {product.cost ? formatPrice(Number(product.cost)) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Berat
                  </p>
                  <p className="text-sm font-medium">
                    {product.weight ? `${formatNumber(Number(product.weight))} kg` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Total Stok
                  </p>
                  <p className={`text-sm font-bold ${totalStock !== null && totalStock <= 0 ? "text-destructive" : "text-green-600"}`}>
                    {totalStock !== null ? totalStock : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Lacak Inventori
                  </p>
                  <Badge variant={product.trackInventory ? "default" : "secondary"}>
                    {product.trackInventory ? "Ya" : "Tidak"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">SKU & Varian</CardTitle>
                  <CardDescription className="text-xs">
                    {variantCount} varian
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {variantCount === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada varian</p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left px-4 py-2 font-medium">Varian</th>
                        <th className="text-left px-4 py-2 font-medium">SKU</th>
                        <th className="text-right px-4 py-2 font-medium">Harga</th>
                        <th className="text-right px-4 py-2 font-medium">Stok</th>
                        <th className="text-center px-4 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants?.map((v) => {
                        const stock = v.inventory?.quantity ?? 0;
                        const threshold = v.inventory?.lowStockThreshold;
                        return (
                          <tr key={v.id} className="border-b last:border-0">
                            <td className="px-4 py-3 font-medium">{v.title}</td>
                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{v.sku}</td>
                            <td className="px-4 py-3 text-right">{formatPrice(v.price)}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={
                                stock <= 0 ? "text-destructive font-medium" :
                                threshold && stock <= threshold ? "text-amber-600 font-medium" :
                                "text-green-600 font-medium"
                              }>
                                {stock}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={v.isActive ? "default" : "secondary"} className="text-[10px] h-5">
                                {v.isActive ? "Aktif" : "Nonaktif"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Gambar Produk</CardTitle>
                  <CardDescription className="text-xs">
                    {product.images?.length ?? 0} gambar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(product.images?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada gambar</p>
              ) : (
                <div className="space-y-2">
                  {product.images?.map((img) => (
                    <div key={img.id} className="flex items-center gap-3 text-sm border rounded-lg p-2">
                      <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                        <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-mono text-muted-foreground">{img.url}</p>
                        {img.alt && <p className="text-xs text-muted-foreground">{img.alt}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground">#{img.position}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attributes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Tag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Atribut</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {((product as any).attributes?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada atribut</p>
              ) : (
                <div className="space-y-2">
                  {(product as any).attributes?.map((attr: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 text-sm border rounded-lg px-3 py-2">
                      <span className="font-medium min-w-[120px]">{attr.name}</span>
                      <span className="text-muted-foreground">{attr.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Pratinjau SEO</CardTitle>
                  <CardDescription className="text-xs">
                    Tampilan produk di hasil pencarian Google
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-[600px]">
                <div className="text-sm leading-tight">
                  <div className="flex items-center gap-1.5 text-xs text-[#202124]">
                    <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                      S
                    </span>
                    <span className="font-medium">Toko Anda</span>
                    <span className="text-muted-foreground">&rsaquo;</span>
                    <span className="text-muted-foreground">Produk</span>
                    <span className="text-muted-foreground">&rsaquo;</span>
                    <span className="truncate">{product.name}</span>
                  </div>

                  <div className="text-xl text-[#1a0dab] leading-tight mt-1">
                    {product.seoTitle
                      ? product.seoTitle.length > 60
                        ? product.seoTitle.slice(0, 60) + "..."
                        : product.seoTitle
                      : product.name.length > 60
                        ? product.name.slice(0, 60) + "..."
                        : product.name}
                  </div>

                  <div className="text-sm text-[#006621] leading-tight mt-0.5">
                    tokoanda.com / produk / {product.slug}
                  </div>

                  <div className="text-sm text-[#4d5156] leading-relaxed mt-0.5">
                    {product.seoDescription
                      ? product.seoDescription.length > 160
                        ? product.seoDescription.slice(0, 157) + "..."
                        : product.seoDescription
                      : product.description
                        ? product.description.length > 160
                          ? product.description.slice(0, 157) + "..."
                          : product.description
                        : "Deskripsi produk tidak tersedia."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
