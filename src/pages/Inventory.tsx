import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { computeLowStock } from "@/features/inventory/utils/inventoryHelpers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoriesQuery } from "@/features/inventory";
import { inventoryApi } from "@/features/inventory";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Row = {
  id: string;
  productId?: string;
  productSlug?: string;
  name: string;
  sku: string;
  quantity: number;
  reserved: number;
};

export default function Inventory() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<
    "name" | "sku" | "quantity" | "reserved" | "updatedAt"
  >("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<
    Record<string, { quantity: string; reserved: string }>
  >({});
  const [confirmItem, setConfirmItem] = useState<Row | null>(null);

  const { data, isLoading, error, refetch, isRefetching } = useInventoriesQuery(
    {
      page,
      limit,
      q: searchTerm || undefined,
      status: (status as any) || undefined,
      sortBy,
      sortOrder,
    }
  );

  const rows: Row[] = useMemo(() => {
    const items = data?.data || [];
    return items.map((it) => ({
      id: it.id,
      productId: it.productId,
      productSlug: it.productSlug,
      name: it.name,
      sku: it.sku,
      quantity: it.quantity,
      reserved: it.reserved,
    }));
  }, [data]);

  const startEdit = (item: Row) => {
    setEditingId(item.id);
    setEditValues((prev) => ({
      ...prev,
      [item.id]: {
        quantity: String(item.quantity),
        reserved: String(item.reserved),
      },
    }));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const onChangeField = (
    id: string,
    field: keyof { quantity: string; reserved: string },
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const attemptSave = (item: Row) => {
    const draft = editValues[item.id];
    const quantity = Number(draft?.quantity ?? item.quantity);
    const reserved = Number(draft?.reserved ?? item.reserved);
    if (!Number.isFinite(quantity) || !Number.isFinite(reserved)) {
      toast.error("Input harus berupa angka");
      return;
    }
    if (quantity < 0 || reserved < 0) {
      toast.error("Nilai tidak boleh negatif");
      return;
    }
    if (reserved > quantity) {
      toast.error("Reserved tidak boleh melebihi stock");
      return;
    }
    setConfirmItem(item);
  };

  const confirmSave = async () => {
    if (!confirmItem) return;
    const item = confirmItem;
    const draft = editValues[item.id];
    const quantity = Number(draft?.quantity ?? item.quantity);
    const reserved = Number(draft?.reserved ?? item.reserved);
    setSavingId(item.id);
    try {
      await inventoryApi.updateInventory(item.id, { quantity, reserved });
      toast.success("Inventory berhasil diperbarui");
      setEditingId(null);
      setSavingId(null);
      setConfirmItem(null);
      await refetch();
    } catch (err: any) {
      setSavingId(null);
      setConfirmItem(null);
      toast.error(err?.error?.message || "Gagal memperbarui inventory");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Management</CardTitle>
        <CardDescription>
          Kelola stok, SKU, dan pantau indikator low stock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(error as any) && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Terjadi kesalahan</AlertTitle>
            <AlertDescription>
              {(error as any)?.message || "Gagal memuat data"}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari nama atau SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") refetch();
              }}
            />
          </div>
          <Select
            value={status ?? "all"}
            onValueChange={(val) => setStatus(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="out">Out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Urutkan berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Terbaru</SelectItem>
              <SelectItem value="name">Nama Produk</SelectItem>
              <SelectItem value="sku">SKU</SelectItem>
              <SelectItem value="quantity">Stock/Qty</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <ArrowUpDown className="mr-2 size-4" />{" "}
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </Button>
          <Button onClick={() => refetch()} disabled={isRefetching}>
            <Filter className="mr-2 size-4" /> Terapkan
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">Belum ada item inventory</p>
            <Button onClick={() => navigate("/catalog/new")}>
              <Plus className="mr-2 size-4" /> Tambah Produk
            </Button>
          </div>
        ) : (
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="text-right">Stock/Qty</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead>Low Stock</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => {
                const stockNum = item.quantity;
                const reservedNum = item.reserved;
                const isLow = computeLowStock(stockNum, reservedNum);
                const isEditing = editingId === item.id;
                const ev = editValues[item.id];
                return (
                  <TableRow key={item.id}>
                    <TableCell className="w-[300px]">
                      <div className="truncate font-medium">{item.name}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell w-[200px]">
                      <span className="font-mono text-xs">{item.sku}</span>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      {isEditing ? (
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="text-right"
                          value={ev?.quantity ?? String(item.quantity)}
                          onChange={(e) =>
                            onChangeField(item.id, "quantity", e.target.value)
                          }
                        />
                      ) : (
                        <p className="tabular-nums text-right">
                          {item.quantity}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="w-[140px]">
                      {isEditing ? (
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="text-right"
                          value={ev?.reserved ?? String(item.reserved)}
                          onChange={(e) =>
                            onChangeField(item.id, "reserved", e.target.value)
                          }
                        />
                      ) : (
                        <p className="tabular-nums text-right">
                          {item.reserved}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive">
                          <AlertCircle className="size-3" /> Low
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (item.productSlug) {
                              navigate(
                                `/catalog/${item.productSlug}?id=${item.productId}`
                              );
                            } else {
                              toast.info("Slug produk tidak tersedia");
                            }
                          }}
                        >
                          <Eye className="mr-2 size-4" /> View
                        </Button>
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => attemptSave(item)}
                              disabled={savingId === item.id}
                            >
                              Simpan
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              disabled={savingId === item.id}
                            >
                              Batal
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(item)}
                          >
                            <Pencil className="mr-2 size-4" /> Edit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {data?.pagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Halaman {data.pagination.page} dari {data.pagination.totalPages} •
              Total {data.pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={(val) => setLimit(Number(val))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                disabled={!data.pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={!data.pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
        <AlertDialog
          open={!!confirmItem}
          onOpenChange={(o) => !o && setConfirmItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Penyimpanan</AlertDialogTitle>
              <AlertDialogDescription>
                Perubahan stok dan reserved akan disimpan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmItem(null)}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave}>
                Simpan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
