import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Plus, X, ChevronLeft, ChevronRight, Tag, Percent, Gift, Trash2,
} from "lucide-react";
import { usePromotionsQuery, useDeletePromotion } from "@/features/promotions";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Promotion } from "@/features/promotions/api/promotionApi";
import { cn } from "@/lib/utils";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);

const typeLabel: Record<string, { label: string; icon: React.ElementType }> = {
  PERCENTAGE: { label: "Persentase", icon: Percent },
  FIXED_AMOUNT: { label: "Nominal", icon: Tag },
  FREE_SHIPPING: { label: "Gratis Ongkir", icon: Gift },
};

const typeBadgeClass: Record<string, string> = {
  PERCENTAGE: "bg-blue-100 text-blue-800 border-0",
  FIXED_AMOUNT: "bg-amber-100 text-amber-800 border-0",
  FREE_SHIPPING: "bg-green-100 text-green-800 border-0",
};

export default function Promotions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = usePromotionsQuery({
    page, limit: 15,
    q: debounced || undefined,
    sortBy: "createdAt", sortOrder: "desc",
  });

  const deleteMutation = useDeletePromotion();
  const promotions = data?.data || [];
  const pagination = data?.pagination;

  const getPageNumbers = () => {
    if (!pagination) return [];
    const { page: p, totalPages: tp } = pagination;
    const pages: (number | "...")[] = [];
    if (tp <= 7) { for (let i = 1; i <= tp; i++) pages.push(i); }
    else {
      pages.push(1);
      if (p > 3) pages.push("...");
      for (let i = Math.max(2, p - 1); i <= Math.min(tp - 1, p + 1); i++) pages.push(i);
      if (p < tp - 2) pages.push("...");
      pages.push(tp);
    }
    return pages;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{(error as any)?.error?.message || "Gagal memuat promosi"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promosi</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Kelola diskon dan kupon promosi</p>
          </div>
          {pagination && !isLoading && (
            <Badge variant="secondary" className="h-6 text-xs font-normal">{pagination.total} promosi</Badge>
          )}
        </div>
        <Button onClick={() => navigate("/promotions/new")} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Promosi
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari promosi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Judul Promosi</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Kode Kupon</TableHead>
                <TableHead className="text-right">Nilai</TableHead>
                <TableHead className="text-center">Produk</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    {debounced ? "Tidak ada promosi ditemukan" : "Belum ada promosi"}
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo, idx) => {
                  const p = promotions[idx];
                  const Ti = typeLabel[p.type]?.icon ?? Tag;
                  const productCount = p._count?.promotionProducts ?? p.promotionProducts?.length ?? 0;
                  const isExpired = p.endsAt && new Date(p.endsAt) < new Date();
                  const isUpcoming = p.startsAt && new Date(p.startsAt) > new Date();

                  return (
                    <TableRow key={promo.id} className="cursor-pointer" onClick={() => navigate(`/promotions/${promo.id}`)}>
                      <TableCell className="text-muted-foreground text-xs">
                        {((pagination?.page || 1) - 1) * (pagination?.limit || 15) + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.title}</p>
                          {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px] h-5", typeBadgeClass[p.type] || "bg-gray-100")}>
                          <Ti className="h-3 w-3 mr-1" />
                          {typeLabel[p.type]?.label ?? p.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {p.couponCode ? (
                          <Badge variant="outline" className="font-mono text-xs">{p.couponCode}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {p.type === "FREE_SHIPPING"
                          ? "Gratis"
                          : p.value ? (
                            p.type === "PERCENTAGE"
                              ? `${p.value}%`
                              : formatCurrency(p.value)
                          ) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs font-normal">
                          {productCount} produk
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.startsAt ? new Date(p.startsAt).toLocaleDateString("id-ID") : "—"}
                        {" – "}
                        {p.endsAt ? new Date(p.endsAt).toLocaleDateString("id-ID") : "Tanpa batas"}
                      </TableCell>
                      <TableCell className="text-center">
                        {!p.isActive ? (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[10px] h-5 border-0">Nonaktif</Badge>
                        ) : isExpired ? (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 text-[10px] h-5 border-0">Berakhir</Badge>
                        ) : isUpcoming ? (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px] h-5 border-0">Terjadwal</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px] h-5 border-0">Aktif</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus promosi?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{p.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(p.id)}
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">{pagination.total} promosi</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" disabled={!pagination.hasPrev} onClick={() => setPage(pagination.page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers().map((pg, i) => pg === "..." ? (
                <span key={`d-${i}`} className="w-8 text-center text-sm text-muted-foreground">...</span>
              ) : (
                <Button key={pg} variant={pagination.page === pg ? "default" : "outline"} size="icon-sm" className="text-xs" onClick={() => setPage(pg as number)}>
                  {pg}
                </Button>
              ))}
              <Button variant="outline" size="icon-sm" disabled={!pagination.hasNext} onClick={() => setPage(pagination.page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
