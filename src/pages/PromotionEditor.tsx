import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Percent, Tag, Gift, Calendar, Package, ArrowLeft, X, Search,
} from "lucide-react";
import {
  promotionFormSchema,
  type PromotionFormData,
  useCreatePromotion,
  useUpdatePromotion,
  usePromotionQuery,
  type Promotion,
} from "@/features/promotions";
import { useProductsQuery } from "@/features/catalog";
import { cn } from "@/lib/utils";

const typeOptions = [
  { value: "PERCENTAGE", label: "Persentase (%)", icon: Percent, desc: "Diskon berdasarkan persentase" },
  { value: "FIXED_AMOUNT", label: "Nominal (Rp)", icon: Tag, desc: "Potongan harga nominal" },
  { value: "FREE_SHIPPING", label: "Gratis Ongkir", icon: Gift, desc: "Bebas biaya pengiriman" },
] as const;

const formatPrice = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const mapPromotionToForm = (p: Promotion): PromotionFormData => ({
  title: p.title,
  description: p.description || "",
  couponCode: p.couponCode || "",
  type: p.type,
  value: p.value ?? undefined,
  currency: p.currency || undefined,
  startsAt: p.startsAt ? p.startsAt.slice(0, 16) : "",
  endsAt: p.endsAt ? p.endsAt.slice(0, 16) : "",
  isActive: p.isActive,
  minSubtotal: p.minSubtotal ?? undefined,
  usageLimit: p.usageLimit ?? undefined,
  usageLimitPerCustomer: p.usageLimitPerCustomer ?? undefined,
  productIds: p.promotionProducts?.map((pp) => pp.productId) || [],
});

export default function PromotionEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== "new";

  const { data: promoResp, isLoading: isLoadingPromo, error: promoError } = usePromotionQuery(isEdit ? id! : "");
  const promoData = promoResp?.data;
  const { data: productsData } = useProductsQuery({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" });
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

  const { register, watch, setValue, reset, formState: { errors } } = form;
  const promoType = useWatch({ control: form.control, name: "type" });
  const watchProductIds = useWatch({ control: form.control, name: "productIds" });

  useEffect(() => {
    if (isEdit && promoData) {
      reset(mapPromotionToForm(promoData));
    }
  }, [isEdit, promoData, reset]);

  const allProducts = productsData?.data || [];
  const selectedProducts = allProducts.filter((p) => watchProductIds?.includes(p.id));

  const toggleProduct = (productId: string) => {
    const current = watchProductIds || [];
    if (current.includes(productId)) {
      setValue("productIds", current.filter((id) => id !== productId), { shouldValidate: true });
    } else {
      setValue("productIds", [...current, productId], { shouldValidate: true });
    }
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
                <CardDescription>Pilih jenis promosi dan masukkan nilainya</CardDescription>
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
                          const isSelected = field.value === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => field.onChange(opt.value)}
                              className={cn(
                                "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all text-center",
                                isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                              )}
                            >
                              <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                              <span className={cn("text-sm font-medium", isSelected && "text-primary")}>{opt.label}</span>
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
                      id="value"
                      type="number"
                      step={promoType === "PERCENTAGE" ? "1" : "1000"}
                      min="1"
                      max={promoType === "PERCENTAGE" ? "100" : undefined}
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
              <CardHeader>
                <CardTitle className="text-base">Produk Promosi</CardTitle>
                <CardDescription>Pilih produk yang termasuk dalam promosi ini</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProducts.map((p) => (
                      <Badge key={p.id} variant="secondary" className="gap-1.5 py-1.5 pl-2 pr-1">
                        {p.name}
                        <button type="button" onClick={() => toggleProduct(p.id)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {allProducts.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground text-sm">Tidak ada produk</p>
                  ) : (
                    allProducts.map((p) => {
                      const isSelected = watchProductIds?.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProduct(p.id)}
                          className={cn(
                            "flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0",
                            isSelected && "bg-primary/5"
                          )}
                        >
                          <div className={cn(
                            "h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                          )}>
                            {isSelected && (
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(p.basePrice)}</p>
                          </div>
                          {p.isFeatured && <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-amber-400/20 text-amber-700 border-0">Unggulan</Badge>}
                        </button>
                      );
                    })
                  )}
                </div>
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
