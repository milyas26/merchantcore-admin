import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductForm } from "@/features/catalog/hooks/useProductForm";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Image as ImageIcon, Package, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CatalogEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug && slug !== "new";

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
    addVariantOption,
    removeVariantOption,
    addAttribute,
    removeAttribute,
  } = useProductForm({
    onSuccess: () => {
      navigate("/catalog");
    },
    onError: (error) => {
      console.error("Form error:", error);
    },
  });

  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? "Edit produk yang sudah ada"
                : "Buat produk baru untuk katalog Anda"}
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
              {isLoading
                ? "Menyimpan..."
                : isEditMode
                ? "Update Produk"
                : "Simpan Produk"}
            </Button>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Ada kesalahan dalam form. Silakan periksa kembali data yang Anda
              masukkan.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
            <TabsTrigger value="variants">Varian</TabsTrigger>
            <TabsTrigger value="images">Gambar</TabsTrigger>
            <TabsTrigger value="attributes">Atribut</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Dasar</CardTitle>
                <CardDescription>Informasi utama produk Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Masukkan nama produk"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Deskripsi produk"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Kategori *</Label>
                    <Select
                      onValueChange={(value) => setValue("categoryId", value)}
                    >
                      <SelectTrigger
                        className={errors.categoryId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Elektronik</SelectItem>
                        <SelectItem value="clothing">Pakaian</SelectItem>
                        <SelectItem value="books">Buku</SelectItem>
                        <SelectItem value="home">Rumah</SelectItem>
                        <SelectItem value="sports">Olahraga</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.categoryId && (
                      <p className="text-sm text-red-500">
                        {errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      {...register("sku")}
                      placeholder="Stock Keeping Unit"
                    />
                    {errors.sku && (
                      <p className="text-sm text-red-500">
                        {errors.sku.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Harga Dasar *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      {...register("basePrice", { valueAsNumber: true })}
                      placeholder="0.00"
                      className={errors.basePrice ? "border-red-500" : ""}
                    />
                    {errors.basePrice && (
                      <p className="text-sm text-red-500">
                        {errors.basePrice.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Harga Banding</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      {...register("compareAtPrice", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.compareAtPrice && (
                      <p className="text-sm text-red-500">
                        {errors.compareAtPrice.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Biaya</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      {...register("cost", { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {errors.cost && (
                      <p className="text-sm text-red-500">
                        {errors.cost.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Berat (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    {...register("weight", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-500">
                      {errors.weight.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" {...register("isActive")} />
                    <Label htmlFor="isActive">Aktif</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="isFeatured" {...register("isFeatured")} />
                    <Label htmlFor="isFeatured">Unggulan</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="trackInventory"
                      {...register("trackInventory")}
                    />
                    <Label htmlFor="trackInventory">Lacak Inventori</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Varian Produk</CardTitle>
                    <CardDescription>
                      Kelola varian produk seperti ukuran dan warna
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addVariant} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Varian
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {variantsArray.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4" />
                    <p>Belum ada varian ditambahkan</p>
                    <Button
                      type="button"
                      onClick={addVariant}
                      className="mt-4"
                      size="sm"
                    >
                      Tambah Varian Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variantsArray.fields.map((variant, variantIndex) => (
                      <Card key={variant.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-semibold">
                            Varian {variantIndex + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(variantIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Judul Varian *</Label>
                            <Input
                              {...register(`variants.${variantIndex}.title`)}
                              placeholder="Contoh: Merah M, Biru L"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>SKU Varian</Label>
                            <Input
                              {...register(`variants.${variantIndex}.sku`)}
                              placeholder="SKU varian"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Harga Varian *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`variants.${variantIndex}.price`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Harga Banding</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(
                                `variants.${variantIndex}.compareAtPrice`,
                                { valueAsNumber: true }
                              )}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Biaya</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`variants.${variantIndex}.cost`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Berat (kg)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`variants.${variantIndex}.weight`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Barcode</Label>
                            <Input
                              {...register(`variants.${variantIndex}.barcode`)}
                              placeholder="Barcode"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label>Opsi Varian</Label>
                            <Button
                              type="button"
                              onClick={() => addVariantOption(variantIndex)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Tambah Opsi
                            </Button>
                          </div>

                          {form
                            .watch(`variants.${variantIndex}.options`)
                            ?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <Input
                                  {...register(
                                    `variants.${variantIndex}.options.${optionIndex}.optionName`
                                  )}
                                  placeholder="Nama opsi (contoh: Warna)"
                                  className="flex-1"
                                />
                                <Input
                                  {...register(
                                    `variants.${variantIndex}.options.${optionIndex}.optionValue`
                                  )}
                                  placeholder="Nilai opsi (contoh: Merah)"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeVariantOption(
                                      variantIndex,
                                      optionIndex
                                    )
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gambar Produk</CardTitle>
                    <CardDescription>
                      Unggah dan kelola gambar produk
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addImage} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Gambar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {imagesArray.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Belum ada gambar ditambahkan</p>
                    <Button
                      type="button"
                      onClick={addImage}
                      className="mt-4"
                      size="sm"
                    >
                      Tambah Gambar Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {imagesArray.fields.map((image, index) => (
                      <Card key={image.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary">Gambar {index + 1}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>URL Gambar *</Label>
                            <Input
                              {...register(`images.${index}.url`)}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Alt Text</Label>
                            <Input
                              {...register(`images.${index}.alt`)}
                              placeholder="Deskripsi gambar untuk SEO"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Posisi</Label>
                            <Input
                              type="number"
                              {...register(`images.${index}.position`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attributes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Atribut Produk</CardTitle>
                    <CardDescription>
                      Tambahkan atribut tambahan seperti material, ukuran, dll
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addAttribute} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Atribut
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {attributesArray.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Tag className="h-12 w-12 mx-auto mb-4" />
                    <p>Belum ada atribut ditambahkan</p>
                    <Button
                      type="button"
                      onClick={addAttribute}
                      className="mt-4"
                      size="sm"
                    >
                      Tambah Atribut Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attributesArray.fields.map((attribute, index) => (
                      <Card key={attribute.id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="secondary">Atribut {index + 1}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttribute(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama Atribut *</Label>
                            <Input
                              {...register(`attributes.${index}.name`)}
                              placeholder="Contoh: Material"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Nilai Atribut *</Label>
                            <Input
                              {...register(`attributes.${index}.value`)}
                              placeholder="Contoh: Katun"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label>Posisi</Label>
                          <Input
                            type="number"
                            {...register(`attributes.${index}.position`, {
                              valueAsNumber: true,
                            })}
                            placeholder="0"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>
                  Pengaturan SEO untuk mesin pencari
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Judul SEO</Label>
                  <Input
                    id="seoTitle"
                    {...register("seoTitle")}
                    placeholder="Judul untuk hasil pencarian"
                    maxLength={255}
                  />
                  <p className="text-sm text-muted-foreground">
                    {watch("seoTitle")?.length || 0}/255 karakter
                  </p>
                  {errors.seoTitle && (
                    <p className="text-sm text-red-500">
                      {errors.seoTitle.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Deskripsi SEO</Label>
                  <Textarea
                    id="seoDescription"
                    {...register("seoDescription")}
                    placeholder="Deskripsi untuk hasil pencarian"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-sm text-muted-foreground">
                    {watch("seoDescription")?.length || 0}/500 karakter
                  </p>
                  {errors.seoDescription && (
                    <p className="text-sm text-red-500">
                      {errors.seoDescription.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
};
