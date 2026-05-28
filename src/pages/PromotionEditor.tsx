import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Percent, Tag, Gift, ArrowLeft, Plus, Trash2, Package,
} from "lucide-react";
import {
  promotionFormSchema,
  type PromotionFormData,
  useCreatePromotion,
  useUpdatePromotion,
  usePromotionQuery,
  usePromotionProductsQuery,
} from "@/features/promotions";
import { ProductPickerModal } from "@/features/promotions/ui/ProductPickerModal";
import { useProductsQuery } from "@/features/catalog";
import { cn } from "@/lib/utils";

const typeOptions = [
  { value: "PERCENTAGE", label: "Persentase (%)", icon: Percent, desc: "Diskon berdasarkan persentase" },
  { value: "FIXED_AMOUNT", label: "Nominal (Rp)", icon: Tag, desc: "Potongan harga nominal" },
  { value: "FREE_SHIPPING", label: "Gratis Ongkir", icon: Gift, desc: "Bebas biaya pengiriman" },
] as const;

const formatPrice = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const calcDiscountedPrice = (price: number, type: string, value?: number) => {
  if (!value || type === "FREE_SHIPPING") return price;
  if (type === "PERCENTAGE") return price - (price * value / 100);
  return price - value;
};

export default function PromotionEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "new";
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: promoResp, isLoading: isLoadingPromo, error: promoError } = usePromotionQuery(isEdit ? id! : "");
  const promoData = promoResp?.data;
  const { data: promoProductsResp } = usePromotionProductsQuery(isEdit ? id! : "");
  const { data: productsData } = useProductsQuery({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" });
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      title: "", description: "", couponCode: "",
      type: "PERCENTAGE", value: undefined, currency: "IDR",
      startsAt: "", endsAt: "",
      isActive: true, minSubtotal: undefined,
      usageLimit: undefined, usageLimitPerCustomer: undefined,
      productIds: [],
    },
  });

  const { register, setValue, reset, formState: { errors } } = form;
  const promoType = useWatch({ control: form.control, name: "type" });
  const promoValue = useWatch({ control: form.control, name: "value" });
  const watchProductIds: string[] = useWatch({ control: form.control, name: "productIds" }) || [];

  useEffect(() => {
    if (isEdit && promoData) {
      reset({
        title: promoData.title,
        description: promoData.description || "",
        couponCode: promoData.couponCode || "",
        type: promoData.type,
        value: promoData.value ?? undefined,
        currency: promoData.currency || "IDR",
        startsAt: promoData.startsAt ? promoData.startsAt.slice(0, 16) : "",
        endsAt: promoData.endsAt ? promoData.endsAt.slice(0, 16) : "",
        isActive: promoData.isActive,
        minSubtotal: promoData.minSubtotal ?? undefined,
        usageLimit: promoData.usageLimit ?? undefined,
        usageLimitPerCustomer: promoData.usageLimitPerCustomer ?? undefined,
        productIds: promoData.promotionProducts?.map((pp) => pp.productId) || [],
      });
    }
  }, [isEdit, promoData, reset]);

  const allProducts = productsData?.data || [];
  const promoProducts = (promoProductsResp?.data || []).map((pp) => ({
    id: pp.product.id,
    name: pp.product.name,
    slug: pp.product.slug,
    basePrice: pp.product.basePrice,
    sku: pp.product.sku ?? null,
    isActive: true,
    isFeatured: false,
    trackInventory: false,
    images: pp.product.images || [],
  }));

  const selectedProducts = React.useMemo(() => {
    const combined = new Map<string, typeof allProducts[number]>();
    allProducts.forEach((p) => combined.set(p.id, p));
    promoProducts.forEach((p) => { if (!combined.has(p.id)) combined.set(p.id, p as any); });
    return (watchProductIds || [])
      .map((pid) => combined.get(pid))
      .filter(Boolean) as typeof allProducts;
  }, [allProducts, promoProducts, watchProductIds]);

  const removeProduct = (productId: string) => {
    const next = watchProductIds.filter((pid) => pid !== productId);
    setValue("productIds", next, { shouldValidate: true });
  };

  const handlePickerConfirm = (ids: string[]) => {
    setValue("productIds", ids, { shouldValidate: true });
  };

  const onSubmit = (data: PromotionFormData) => {
    const payload = {
      ...data,
      description: data.description || undefined,
      couponCode: data.couponCode || undefined,
      value: data.type === "FREE_SHIPPING" ? undefined : data.value,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : null,
      endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : null,
      minSubtotal: data.minSubtotal || undefined,
      usageLimit: data.usageLimit || undefined,
      usageLimitPerCustomer: data.usageLimitPerCustomer || undefined,
      productIds: data.productIds || [],
    };

    if (isEdit) {
      updateMutation.mutate({ id: id!, data: payload }, {
        onSuccess: () => navigate("/promotions"),
      });
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: () => navigate("/promotions"),
      });
    }
  };

  if (isEdit && isLoadingPromo) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (isEdit && promoError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Gagal memuat data promosi</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <ProductPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedIds={watchProductIds}
        onSelect={handlePickerConfirm}
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => navigate("/promotions")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isEdit ? "Edit Promosi" : "Promosi Baru"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isEdit ? "Perbarui detail promosi" : "Buat promosi diskon atau kupon baru"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={createMutation.isPending || updateMutation.isPending} onClick={() => navigate("/promotions")}>
              Batal
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Promosi"}
            </Button>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>Periksa kembali data yang diinput.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informasi Promosi</CardTitle>
                <CardDescription>Detail utama promosi</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Judul Promosi <span className="text-destructive">*</span></Label>
                  <Input id="title" {...register("title")} placeholder="Contoh: Diskon Lebaran 50%" className={errors.title ? "border-destructive" : ""} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" {...register("description")} placeholder="Deskripsi singkat promosi" rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="couponCode">Kode Kupon</Label>
                  <Input id="couponCode" {...register("couponCode")} placeholder="LEBARAN2024" className="font-mono uppercase" />
                  {errors.couponCode && <p className="text-sm text-destructive">{errors.couponCode.message}</p>}
                  <p className="text-xs text-muted-foreground">Biarkan kosong jika promosi otomatis (tanpa kode)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tipe & Nilai Promosi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Tipe Promosi <span className="text-destructive">*</span></Label>
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-3">
                        {typeOptions.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => field.onChange(opt.value)}
                              className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all text-center",
                                field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                              )}
                            >
                              <Icon className={cn("h-6 w-6", field.value === opt.value ? "text-primary" : "text-muted-foreground")} />
                              <span className={cn("text-sm font-medium", field.value === opt.value && "text-primary")}>{opt.label}</span>
                              <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>

                {promoType !== "FREE_SHIPPING" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="value">
                      {promoType === "PERCENTAGE" ? "Persentase Diskon (%)" : "Nominal Potongan (Rp)"} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="value" type="number"
                      step={promoType === "PERCENTAGE" ? "1" : "1000"}
                      min="1" max={promoType === "PERCENTAGE" ? "100" : undefined}
                      {...register("value", { valueAsNumber: true })}
                      placeholder={promoType === "PERCENTAGE" ? "10" : "50000"}
                      className={errors.value ? "border-destructive" : ""}
                    />
                    {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="minSubtotal">Minimal Subtotal (Rp)</Label>
                  <Input id="minSubtotal" type="number" step="1000" min="0" {...register("minSubtotal", { valueAsNumber: true })} placeholder="Minimal belanja" />
                  <p className="text-xs text-muted-foreground">Total belanja minimum agar promosi berlaku</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Daftar Produk Promosi</CardTitle>
                    <CardDescription>Produk yang termasuk dalam promosi ini</CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={() => setPickerOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Pilih Produk
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground mb-3">Belum ada produk dipilih</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Pilih Produk
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">#</TableHead>
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-right">Harga Normal</TableHead>
                          <TableHead className="text-right">Harga Diskon</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProducts.map((product, idx) => {
                          const image = product.images?.[0];
                          const discounted = calcDiscountedPrice(product.basePrice, promoType, promoValue);
                          const hasDiscount = promoType !== "FREE_SHIPPING" && discounted < product.basePrice;

                          return (
                            <TableRow key={product.id}>
                              <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {image?.url ? (
                                      <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                                    ) : (
                                      <Package className="h-5 w-5 text-muted-foreground/40" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate max-w-[200px]">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">{product.sku || "—"}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right text-sm font-semibold">
                                {formatPrice(product.basePrice)}
                              </TableCell>
                              <TableCell className="text-right">
                                {hasDiscount ? (
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatPrice(product.basePrice)}
                                    </span>
                                    <span className="text-sm font-bold text-green-600">
                                      {formatPrice(discounted)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">{formatPrice(product.basePrice)}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button" variant="ghost" size="icon-sm"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => removeProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedProducts.length} produk dipilih. Kosongkan jika promosi berlaku untuk semua produk.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Periode & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startsAt">Tanggal Mulai</Label>
                  <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endsAt">Tanggal Berakhir</Label>
                  <Input id="endsAt" type="datetime-local" {...register("endsAt")} />
                  {errors.endsAt && <p className="text-sm text-destructive">{errors.endsAt.message}</p>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <Label htmlFor="isActive" className="cursor-pointer">Promosi Aktif</Label>
                  <Controller name="isActive" control={form.control} render={({ field }) => (
                    <Switch id="isActive" checked={!!field.value} onCheckedChange={field.onChange} />
                  )} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Batas Penggunaan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="usageLimit">Total Maksimal Penggunaan</Label>
                  <Input id="usageLimit" type="number" min="1" {...register("usageLimit", { valueAsNumber: true })} placeholder="100" />
                  <p className="text-xs text-muted-foreground">Biarkan kosong jika tidak terbatas</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="usageLimitPerCustomer">Maksimal Per Pelanggan</Label>
                  <Input id="usageLimitPerCustomer" type="number" min="1" {...register("usageLimitPerCustomer", { valueAsNumber: true })} placeholder="1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
