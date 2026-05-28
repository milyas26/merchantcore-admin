import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useProductForm,
  getProduk,
  mapProductToFormValue,
} from "@/features/catalog/hooks/useProductForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CategorySelector from "@/components/category-selector";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Controller, useWatch } from "react-hook-form";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Tag,
  Package,
  DollarSign,
  Layers,
  Globe,
  Weight,
  Barcode,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
};

const FieldGroup = ({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-1.5", className)}>
    <Label htmlFor={htmlFor}>
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    <FieldError message={error} />
  </div>
);

const SectionCard = ({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {action}
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const StockBadge = ({
  quantity,
  threshold,
}: {
  quantity: number;
  threshold?: number | null;
}) => {
  if (quantity <= 0)
    return <Badge variant="destructive">Habis</Badge>;
  if (threshold && quantity <= threshold)
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        Rendah
      </Badge>
    );
  return (
    <Badge variant="secondary" className="bg-green-100 text-green-800">
      Tersedia
    </Badge>
  );
};

export const CatalogEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug && slug !== "new";

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProduk(slug as string),
    enabled: isEditMode,
  });

  const {
    form,
    onSubmit,
    isLoading,
    imagesArray,
    variantsArray,
    attributesArray,
    addImage,
    removeImage,
    addVariant,
    removeVariant,
    addAttribute,
    removeAttribute,
  } = useProductForm({
    productId: isEditMode ? productQuery.data?.id : undefined,
    onSuccess: () => {
      navigate("/catalog");
    },
    onError: (error) => {
      console.error("Form error:", error);
    },
  });

  const {
    register,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = form;

  const isVariant = useWatch({ control: form.control, name: "isVariant" });
  const trackInventory = useWatch({
    control: form.control,
    name: "trackInventory",
  });
  const productName = useWatch({ control: form.control, name: "name" });
  const productDesc = useWatch({
    control: form.control,
    name: "description",
  });

  useEffect(() => {
    if (isEditMode && productQuery.data) {
      try {
        const values = mapProductToFormValue(productQuery.data);
        reset(values);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isEditMode, productQuery.data, reset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  if (isEditMode && productQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  if (isEditMode && productQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {(productQuery.error as Error)?.message ||
            "Gagal memuat data produk"}
        </AlertDescription>
      </Alert>
    );
  }

  const getVariantErrors = (index: number) =>
    (errors as any)?.variants?.[index];

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditMode ? "Edit Produk" : "Produk Baru"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {isEditMode
                ? "Perbarui detail dan kelola SKU produk"
                : "Lengkapi informasi produk dan SKU"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => navigate("/catalog")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Simpan Produk"}
            </Button>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Terdapat kesalahan pada form. Periksa kembali data yang diinput.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Info */}
          <SectionCard
            icon={Package}
            title="Informasi Dasar"
            description="Nama, deskripsi, dan kategori produk"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4 md:col-span-1">
                <FieldGroup
                  label="Nama Produk"
                  htmlFor="name"
                  required
                  error={errors.name?.message}
                >
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Masukkan nama produk"
                    className={errors.name ? "border-destructive" : ""}
                  />
                </FieldGroup>

                <FieldGroup label="Deskripsi" htmlFor="description">
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Deskripsi lengkap produk"
                    rows={4}
                  />
                </FieldGroup>

                <FieldGroup
                  label="Kategori"
                  required
                  error={errors.categoryId?.message}
                >
                  <CategorySelector
                    onSaveSelect={(id: string) => {
                      setValue("categoryId", id, { shouldValidate: true });
                    }}
                    defaultValue={productQuery.data?.categoryId || ""}
                  />
                </FieldGroup>

                <FieldGroup label="SKU Induk" htmlFor="sku">
                  <Input
                    id="sku"
                    {...register("sku")}
                    placeholder="SKU-001"
                  />
                  <FieldError message={errors.sku?.message} />
                </FieldGroup>
              </div>

              <div className="space-y-4 md:col-span-1">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isActive"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="isActive"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Aktif
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isFeatured"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="isFeatured"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="isFeatured" className="cursor-pointer">
                      Unggulan
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="trackInventory"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="trackInventory"
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label
                      htmlFor="trackInventory"
                      className="cursor-pointer"
                    >
                      Lacak Inventori
                    </Label>
                  </div>
                </div>
                <div className="border-t pt-4 mt-2 space-y-4">
                  <FieldGroup
                    label="Harga Jual"
                    htmlFor="basePrice"
                    required
                    error={errors.basePrice?.message}
                  >
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="basePrice"
                        type="number"
                        step="100"
                        min="0"
                        {...register("basePrice", { valueAsNumber: true })}
                        placeholder="0"
                        className={cn(
                          "pl-9",
                          errors.basePrice && "border-destructive"
                        )}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="HPP (Harga Pokok)" htmlFor="cost">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cost"
                        type="number"
                        step="100"
                        min="0"
                        {...register("cost", { valueAsNumber: true })}
                        placeholder="0"
                        className={cn(
                          errors.cost && "border-destructive",
                          "pl-9"
                        )}
                      />
                    </div>
                    <FieldError message={errors.cost?.message} />
                  </FieldGroup>

                  <FieldGroup label="Berat (kg)" htmlFor="weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("weight", { valueAsNumber: true })}
                        placeholder="0.00"
                        className={cn(
                          errors.weight && "border-destructive",
                          "pl-9"
                        )}
                      />
                    </div>
                    <FieldError message={errors.weight?.message} />
                  </FieldGroup>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SKU / Variant Section */}
          <SectionCard
            icon={Layers}
            title="SKU & Harga Varian"
            description={
              isVariant
                ? "Setiap varian memiliki harga, stok, dan barcode tersendiri"
                : "Produk tanpa varian — satu SKU dengan harga dan stok"
            }
            action={
              !isVariant ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Varian
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="isVariant"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="isVariantTop"
                          checked={!!field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (!checked) {
                              const vars = form.getValues("variants") || [];
                              if (vars.length === 1) {
                                form.setValue("variants", []);
                              }
                            }
                          }}
                        />
                      )}
                    />
                    <Label
                      htmlFor="isVariantTop"
                      className="text-xs cursor-pointer"
                    >
                      Multi Varian
                    </Label>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addVariant}
                    className="h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Tambah
                  </Button>
                </div>
              )
            }
          >
            {!isVariant ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FieldGroup label="Barcode" htmlFor="barcode">
                  <Input
                    id="barcode"
                    {...register("barcode")}
                    placeholder="Kode barcode"
                  />
                  <FieldError message={errors.barcode?.message} />
                </FieldGroup>
                {trackInventory && (
                  <FieldGroup
                    label="Stok Tersedia"
                    htmlFor="inventory.quantity"
                  >
                    <Input
                      id="inventory.quantity"
                      type="number"
                      min="0"
                      {...register("inventory.quantity", {
                        valueAsNumber: true,
                      })}
                      placeholder="0"
                    />
                    <FieldError
                      message={
                        (errors as any)?.inventory?.quantity?.message
                      }
                    />
                  </FieldGroup>
                )}
              </div>
            ) : variantsArray.fields.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <Layers className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-3">
                  Belum ada varian
                </p>
                <Button type="button" onClick={addVariant} size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Varian
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {variantsArray.fields.map((variant, index) => {
                  const vErr = getVariantErrors(index);
                  const variantData = watch(`variants.${index}`);
                  const isExpanded = variantsArray.fields.length === 1;

                  return (
                    <div
                      key={variant.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">
                            {variantData?.title || `Varian ${index + 1}`}
                          </span>
                          {variantData?.sku && (
                            <Badge variant="outline" className="text-xs">
                              {variantData.sku}
                            </Badge>
                          )}
                          {variantData?.barcode && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Barcode className="h-3 w-3" />
                              {variantData.barcode}
                            </span>
                          )}
                          {(!variantData?.isActive) && (
                            <Badge variant="secondary" className="text-xs">
                              Nonaktif
                            </Badge>
                          )}
                          {trackInventory &&
                            variantData?.inventory?.quantity !== undefined && (
                              <StockBadge
                                quantity={variantData.inventory.quantity}
                                threshold={
                                  variantData.inventory.lowStockThreshold
                                }
                              />
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Controller
                            name={`variants.${index}.isActive`}
                            control={form.control}
                            render={({ field }) => (
                              <Switch
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                                className="scale-90"
                              />
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FieldGroup
                            label="Judul Varian"
                            required
                            error={vErr?.title?.message}
                          >
                            <Input
                              {...register(`variants.${index}.title`)}
                              placeholder="Merah M, Biru L"
                            />
                          </FieldGroup>
                          <FieldGroup
                            label="SKU"
                            required
                            error={vErr?.sku?.message}
                          >
                            <Input
                              {...register(`variants.${index}.sku`)}
                              placeholder="SKU-VAR-001"
                            />
                          </FieldGroup>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <FieldGroup
                            label="Harga Jual"
                            required
                            error={vErr?.price?.message}
                          >
                            <Input
                              type="number"
                              step="100"
                              min="0"
                              {...register(`variants.${index}.price`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0"
                            />
                          </FieldGroup>
                          <FieldGroup label="HPP">
                            <Input
                              type="number"
                              step="100"
                              min="0"
                              {...register(`variants.${index}.cost`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0"
                            />
                          </FieldGroup>
                          <FieldGroup label="Berat (kg)">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`variants.${index}.weight`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0.00"
                            />
                          </FieldGroup>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FieldGroup label="Barcode">
                            <Input
                              {...register(`variants.${index}.barcode`)}
                              placeholder="Kode barcode"
                            />
                          </FieldGroup>
                          <FieldGroup label="URL Gambar Varian">
                            <Input
                              {...register(`variants.${index}.image`)}
                              placeholder="https://..."
                            />
                          </FieldGroup>
                        </div>

                        {trackInventory && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t pt-3">
                            <FieldGroup
                              label="Stok"
                              error={
                                vErr?.inventory?.quantity?.message
                              }
                            >
                              <Input
                                type="number"
                                min="0"
                                {...register(
                                  `variants.${index}.inventory.quantity`,
                                  { valueAsNumber: true }
                                )}
                                placeholder="0"
                              />
                            </FieldGroup>
                            <FieldGroup label="Dipesan">
                              <Input
                                type="number"
                                min="0"
                                {...register(
                                  `variants.${index}.inventory.reserved`,
                                  { valueAsNumber: true }
                                )}
                                placeholder="0"
                              />
                            </FieldGroup>
                            <FieldGroup label="Ambang Stok Rendah">
                              <Input
                                type="number"
                                min="1"
                                {...register(
                                  `variants.${index}.inventory.lowStockThreshold`,
                                  { valueAsNumber: true }
                                )}
                                placeholder="10"
                              />
                            </FieldGroup>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Images */}
          <SectionCard
            icon={ImageIcon}
            title="Gambar Produk"
            description="Unggah dan kelola gambar produk"
            action={
              <Button type="button" size="sm" onClick={addImage}>
                <Plus className="h-4 w-4 mr-1.5" />
                Tambah Gambar
              </Button>
            }
          >
            {imagesArray.fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-3">
                  Belum ada gambar
                </p>
                <Button type="button" onClick={addImage} size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Tambah Gambar
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {imagesArray.fields.map((image, index) => (
                  <div
                    key={image.id}
                    className="border rounded-lg p-3 flex gap-3"
                  >
                    <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                      {watch(`images.${index}.url`) ? (
                        <img
                          src={watch(`images.${index}.url`)}
                          alt=""
                          className="h-full w-full object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <FieldGroup label="URL Gambar" required>
                        <Input
                          {...register(`images.${index}.url`)}
                          placeholder="https://..."
                          className="text-xs h-8"
                        />
                      </FieldGroup>
                      <div className="grid grid-cols-2 gap-2">
                        <FieldGroup label="Alt Text">
                          <Input
                            {...register(`images.${index}.alt`)}
                            placeholder="Deskripsi"
                            className="text-xs h-8"
                          />
                        </FieldGroup>
                        <FieldGroup label="Posisi">
                          <Input
                            type="number"
                            {...register(`images.${index}.position`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0"
                            className="text-xs h-8"
                          />
                        </FieldGroup>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Attributes */}
          <SectionCard
            icon={Tag}
            title="Atribut Produk"
            description="Spesifikasi tambahan seperti material, ukuran"
            action={
              <Button type="button" size="sm" onClick={addAttribute}>
                <Plus className="h-4 w-4 mr-1.5" />
                Tambah
              </Button>
            }
          >
            {attributesArray.fields.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-lg">
                <Tag className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Belum ada atribut
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Tambah Atribut
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {attributesArray.fields.map((attribute, index) => (
                  <div
                    key={attribute.id}
                    className="flex items-center gap-3 p-2 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        {...register(`attributes.${index}.name`)}
                        placeholder="Nama (contoh: Material)"
                        className="h-8 text-xs"
                      />
                      <Input
                        {...register(`attributes.${index}.value`)}
                        placeholder="Nilai (contoh: Katun)"
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        {...register(`attributes.${index}.position`, {
                          valueAsNumber: true,
                        })}
                        placeholder="Posisi"
                        className="h-8 text-xs w-20"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => removeAttribute(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* SEO Preview */}
          <SectionCard
            icon={Globe}
            title="Pratinjau SEO"
            description="Pratinjau tampilan produk di hasil pencarian Google"
          >
            <div className="max-w-[600px]">
              <div className="text-sm leading-tight">
                <div className="flex items-center gap-1.5 text-xs text-[#202124]">
                  <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                    S
                  </span>
                  <span className="font-medium">Toko Anda</span>
                  <span className="text-muted-foreground">&rsaquo;</span>
                  <span className="text-muted-foreground">Produk</span>
                  {productName && (
                    <>
                      <span className="text-muted-foreground">&rsaquo;</span>
                      <span className="truncate">{productName}</span>
                    </>
                  )}
                </div>

                <div
                  className={cn(
                    "text-xl text-[#1a0dab] leading-tight mt-1",
                    !productName && "italic"
                  )}
                >
                  {productName
                    ? productName.length > 60
                      ? productName.slice(0, 60) + "..."
                      : productName
                    : "Nama Produk"}
                </div>

                <div className="text-sm text-[#006621] leading-tight mt-0.5">
                  tokoanda.com / produk /
                  {productName
                    ? productName.toLowerCase().replace(/\s+/g, "-").slice(0, 50)
                    : "nama-produk"}
                </div>

                <div className="text-sm text-[#4d5156] leading-relaxed mt-0.5">
                  {productDesc
                    ? productDesc.length > 160
                      ? productDesc.slice(0, 157) + "..."
                      : productDesc
                    : "Deskripsi produk akan muncul di sini. Tulis deskripsi yang menarik dan informatif untuk meningkatkan klik."}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3 border-t pt-3">
                Judul dan deskripsi SEO akan diambil otomatis dari Nama Produk dan
                Deskripsi yang kamu isi di form.
              </p>
            </div>
          </SectionCard>
        </div>
      </form>
    </div>
  );
};
