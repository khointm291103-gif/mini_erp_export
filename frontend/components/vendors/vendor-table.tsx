'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { vendorsApi } from '@/lib/api/vendors';
import type { Vendor, VendorStatus } from '@/lib/types/vendor';

const STATUS_BADGE: Record<VendorStatus, { label: string; class: string }> = {
  ACTIVE: { label: 'Hoạt động', class: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', class: 'bg-slate-100 text-slate-600' },
  BLACKLISTED: { label: 'Đen sách', class: 'bg-red-100 text-red-700' },
};

export function VendorTable() {
  const router = useRouter();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VendorStatus | ''>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    clearTimeout((window as unknown as { _st?: ReturnType<typeof setTimeout> })._st);
    (window as unknown as { _st?: ReturnType<typeof setTimeout> })._st = setTimeout(() => {
      setDebouncedSearch(v);
      setPage(1);
    }, 300);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', { search: debouncedSearch, status, page }],
    queryFn: () => vendorsApi.list({ search: debouncedSearch || undefined, status: status || undefined, page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vendorsApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa nhà cung cấp thành công');
      qc.invalidateQueries({ queryKey: ['vendors'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Không thể xóa nhà cung cấp'),
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm theo tên, mã số thuế, mã NCC..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v: string | null) => { setStatus((v ?? '') as VendorStatus | ''); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Ngừng</SelectItem>
            <SelectItem value="BLACKLISTED">Đen sách</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-sky-700 hover:bg-sky-800 ml-auto cursor-pointer" onClick={() => router.push('/vendors/new')}>
          <Plus className="w-4 h-4 mr-1.5" /> Thêm mới
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-28">Mã NCC</TableHead>
                <TableHead>Tên nhà cung cấp</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead className="w-24">Trạng thái</TableHead>
                <TableHead className="w-24 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    Không có nhà cung cấp nào
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((v) => (
                  <TableRow key={v.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500">{v.vendorCode}</TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-900">{v.name}</p>
                      {v.taxCode && <p className="text-xs text-slate-400">MST: {v.taxCode}</p>}
                    </TableCell>
                    <TableCell>
                      {v.contactName && <p className="text-sm">{v.contactName}</p>}
                      {v.contactPhone && <p className="text-xs text-slate-400">{v.contactPhone}</p>}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{v.paymentDueDays > 0 ? `Net ${v.paymentDueDays}d` : 'Ngay'}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE[v.status].class}>
                        {STATUS_BADGE[v.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="w-8 h-8 cursor-pointer" onClick={() => router.push(`/vendors/${v.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 cursor-pointer" onClick={() => router.push(`/vendors/${v.id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-red-500 hover:text-red-600 cursor-pointer" onClick={() => setDeleteTarget(v)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Hiển thị {(page - 1) * 20 + 1}–{Math.min(page * 20, data.meta.total)} / {data.meta.total} nhà cung cấp
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="cursor-pointer">Trước</Button>
              <Button size="sm" variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)} className="cursor-pointer">Sau</Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa nhà cung cấp <strong>{deleteTarget?.name}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
