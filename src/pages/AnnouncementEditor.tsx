import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
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
import { ArrowLeft, Save, Info, AlertTriangle, Tag, Wrench } from "lucide-react";
import {
  useAnnouncementQuery,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  announcementFormSchema,
  type AnnouncementFormData,
  type AnnouncementType,
} from "@/features/announcement";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const typeOptions: { value: AnnouncementType; label: string; icon: React.ElementType }[] = [
  { value: "INFO", label: "Info", icon: Info },
  { value: "WARNING", label: "Warning", icon: AlertTriangle },
  { value: "PROMO", label: "Promo", icon: Tag },
  { value: "MAINTENANCE", label: "Maintenance", icon: Wrench },
];

export default function AnnouncementEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new" || !id;

  const { data: existing, isLoading } = useAnnouncementQuery(isNew ? "" : id!);
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      type: "INFO",
      isActive: true,
      startsAt: "",
      endsAt: "",
    },
  });

  useEffect(() => {
    if (existing?.data && !isNew) {
      const a = existing.data;
      const toLocalISO = (val: string | null) =>
        val ? new Date(val).toISOString().slice(0, 16) : "";
      reset({
        title: a.title,
        description: a.description || "",
        link: a.link || "",
        type: a.type,
        isActive: a.isActive,
        startsAt: toLocalISO(a.startsAt),
        endsAt: toLocalISO(a.endsAt),
      });
    }
  }, [existing, isNew, reset]);

  const onSubmit = async (formData: AnnouncementFormData) => {
    const payload = {
      ...formData,
      description: formData.description || undefined,
      link: formData.link || undefined,
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
      endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
    };

    if (isNew) {
      createMutation.mutate(payload as any, {
        onSuccess: () => navigate("/announcements"),
      });
    } else {
      updateMutation.mutate({ id: id!, data: payload as any }, {
        onSuccess: () => navigate("/announcements"),
      });
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-32" />
        </Card>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/announcements")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNew ? "Tambah Pengumuman" : "Edit Pengumuman"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isNew ? "Buat pengumuman baru untuk frontstore" : "Perbarui pengumuman yang sudah ada"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                placeholder="Masukkan judul pengumuman"
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Masukkan isi pengumuman (opsional)"
                rows={4}
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                placeholder="https://example.com (opsional)"
                {...register("link")}
                className={errors.link ? "border-destructive" : ""}
              />
              {errors.link && (
                <p className="text-sm text-destructive">{errors.link.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipe</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Pilih tipe pengumuman" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Tanggal Mulai</Label>
                <Input
                  id="startsAt"
                  type="datetime-local"
                  {...register("startsAt")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endsAt">Tanggal Berakhir</Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  {...register("endsAt")}
                  className={errors.endsAt ? "border-destructive" : ""}
                />
                {errors.endsAt && (
                  <p className="text-sm text-destructive">{errors.endsAt.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Pengumuman aktif
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/announcements")}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                <Save className="h-4 w-4 mr-1.5" />
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
