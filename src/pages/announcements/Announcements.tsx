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
  Search, Plus, X, ChevronLeft, ChevronRight, Info, AlertTriangle, Tag, Wrench, Trash2,
} from "lucide-react";
import { useAnnouncementsQuery, useDeleteAnnouncement } from "@/features/announcement";
import type { AnnouncementType } from "@/features/announcement";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const typeLabel: Record<string, { label: string; icon: React.ElementType }> = {
  INFO: { label: "Info", icon: Info },
  WARNING: { label: "Warning", icon: AlertTriangle },
  PROMO: { label: "Promo", icon: Tag },
  MAINTENANCE: { label: "Maintenance", icon: Wrench },
};

const typeBadgeClass: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-800 border-0",
  WARNING: "bg-amber-100 text-amber-800 border-0",
  PROMO: "bg-green-100 text-green-800 border-0",
  MAINTENANCE: "bg-red-100 text-red-800 border-0",
};

export default function Announcements() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useAnnouncementsQuery({
    page, limit: 15,
    q: debounced || undefined,
    sortBy: "createdAt", sortOrder: "desc",
  });

  const deleteMutation = useDeleteAnnouncement();
  const announcements = data?.data || [];
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
        <AlertDescription>{(error as any)?.error?.message || "Gagal memuat pengumuman"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pengumuman</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Kelola pengumuman untuk frontstore</p>
          </div>
          {pagination && !isLoading && (
            <Badge variant="secondary" className="h-6 text-xs font-normal">{pagination.total} pengumuman</Badge>
          )}
        </div>
        <Button onClick={() => navigate("/announcements/new")} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Tambah Pengumuman
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari pengumuman..."
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

      <Card className="px-4 min-h-screen">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {debounced ? "Tidak ada pengumuman ditemukan" : "Belum ada pengumuman"}
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((a, idx) => {
                  const Ti = typeLabel[a.type]?.icon ?? Info;
                  const isExpired = a.endsAt && new Date(a.endsAt) < new Date();
                  const isUpcoming = a.startsAt && new Date(a.startsAt) > new Date();

                  return (
                    <TableRow key={a.id} className="cursor-pointer" onClick={() => navigate(`/announcements/${a.id}`)}>
                      <TableCell className="text-muted-foreground text-xs">
                        {((pagination?.page || 1) - 1) * (pagination?.limit || 15) + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{a.title}</p>
                          {a.link && (
                            <a
                              href={a.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {a.link}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("text-[10px] h-5", typeBadgeClass[a.type] || "bg-gray-100")}>
                          <Ti className="h-3 w-3 mr-1" />
                          {typeLabel[a.type]?.label ?? a.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                        <span className="line-clamp-2">{a.description || "—"}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {a.startsAt ? new Date(a.startsAt).toLocaleDateString("id-ID") : "—"}
                        {" – "}
                        {a.endsAt ? new Date(a.endsAt).toLocaleDateString("id-ID") : "Tanpa batas"}
                      </TableCell>
                      <TableCell className="text-center">
                        {!a.isActive ? (
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
                              <AlertDialogTitle>Hapus pengumuman?</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{a.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate(a.id)}
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
            <p className="text-sm text-muted-foreground">{pagination.total} pengumuman</p>
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
