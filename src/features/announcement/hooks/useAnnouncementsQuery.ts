import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  announcementApi,
  type GetAnnouncementsQuery,
  type CreateAnnouncementRequest,
  type UpdateAnnouncementRequest,
} from "../api/announcementApi";
import { toast } from "sonner";

const KEY = "announcements";

export function useAnnouncementsQuery(query?: GetAnnouncementsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => announcementApi.getAnnouncements(query),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAnnouncementQuery(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => announcementApi.getAnnouncementById(id),
    enabled: !!id,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementRequest) => announcementApi.createAnnouncement(data),
    onSuccess: () => {
      toast.success("Pengumuman berhasil dibuat");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (e: any) => {
      toast.error(e?.error?.message || "Gagal membuat pengumuman");
    },
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementRequest }) =>
      announcementApi.updateAnnouncement(id, data),
    onSuccess: () => {
      toast.success("Pengumuman berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (e: any) => {
      toast.error(e?.error?.message || "Gagal memperbarui pengumuman");
    },
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementApi.deleteAnnouncement(id),
    onSuccess: () => {
      toast.success("Pengumuman berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (e: any) => {
      toast.error(e?.error?.message || "Gagal menghapus pengumuman");
    },
  });
}
