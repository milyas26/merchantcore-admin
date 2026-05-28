import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { promotionApi, type GetPromotionsQuery, type CreatePromotionRequest, type UpdatePromotionRequest } from "../api/promotionApi";
import { toast } from "sonner";

const KEY = "promotions";

export function usePromotionsQuery(query?: GetPromotionsQuery) {
  return useQuery({
    queryKey: [KEY, query],
    queryFn: () => promotionApi.getPromotions(query),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePromotionQuery(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => promotionApi.getPromotionById(id),
    enabled: !!id,
  });
}

export function usePromotionProductsQuery(promotionId: string) {
  return useQuery({
    queryKey: [KEY, promotionId, "products"],
    queryFn: () => promotionApi.getPromotionProducts(promotionId),
    enabled: !!promotionId,
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePromotionRequest) => promotionApi.createPromotion(data),
    onSuccess: () => {
      toast.success("Promosi berhasil dibuat");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (e: any) => {
      toast.error(e?.error?.message || "Gagal membuat promosi");
    },
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionRequest }) =>
      promotionApi.updatePromotion(id, data),
    onSuccess: () => {
      toast.success("Promosi berhasil diperbarui");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (e: any) => {
      toast.error(e?.error?.message || "Gagal memperbarui promosi");
    },
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => promotionApi.deletePromotion(id),
    onSuccess: () => {
      toast.success("Promosi berhasil dihapus");
      qc.invalidateQueries({ queryKey: [KEY] });
    },
    onError: (e: any) => {
      toast.error(e?.error?.message || "Gagal menghapus promosi");
    },
  });
}
