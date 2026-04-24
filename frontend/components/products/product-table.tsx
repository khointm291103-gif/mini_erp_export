'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { productsApi } from '@/lib/api/products';
import type { Product, ProductStatus } from '@/lib/types/product';

const STATUS_BADGE: Record<ProductStatus, { label: string; class: string }> = {
  ACTIVE: { label: 'Hoạt động', class: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', class: 'bg-slate-100 text-slate-600' },
  DISCONTINUED: { label: 'Ngừng sản xuất', class: 'bg-red-100 text-red-600' },
};

export function ProductTable() {
  const router = useRouter();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    clearTimeout((window as unknown as { _pst?: ReturnType<typeof setTimeout> })._pst);
    (window as unknown as { _pst?: ReturnType<typeof setTimeout> })._pst = setTimeout(() => {
      setDebouncedSearch(v); setPage(1);
    }, 300);
  }, []);

  const { data: categories = [] } = useQuery({ queryKey: ['categories', true], queryFn: () => productsApi.categories(true) });
  const flatCats: { id: string; name: string }[] = [];
  const flattenCats = (cats: typeof categories) => cats.forEach(c => { flatCats.push({ id: c.id, name: c.name }); if (c.children) flattenCats(c.children); });
  flattenCats(categories);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search: debouncedSearch, categoryId, status, page }],
    queryFn: () => productsApi.list({ search: debouncedSearch || undefined, categoryId: categoryId || undefined, status: status || undefined, page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => { toast.success('Xóa sản phẩm thành công'); qc.invalidateQueries({ queryKey: ['products'] }); setDeleteTarget(null); },
    onError: () => toast.error('Không thể xóa sản phẩm'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Tìm tên, mã, HS code..." className="pl-9" value={search} onChange={e => handleSearch(e.target.value)} />
        </div>
        <Select value={categoryId} onValueChange={(v: string | null) => { setCategoryId(v ?? ''); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Danh mục" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả danh mục</SelectItem>
            {flatCats.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v: string | null) => { setStatus((v ?? '') as ProductStatus | ''); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tất cả</SelectItem>
            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
            <SelectItem value="INACTIVE">Ngừng</SelectItem>
            <SelectItem value="DISCONTINUED">Ngừng SX</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-sky-700 hover:bg-sky-800 ml-auto cursor-pointer" onClick={() => router.push('/products/new')}>
          <Plus className="w-4 h-4 mr-1.5" /> Thêm mới
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-28">Mã SP</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead className="w-28">HS Code</TableHead>
                <TableHead className="w-24">Danh mục</TableHead>
                <TableHead className="w-20">Đơn vị</TableHead>
                <TableHead className="w-24">Trạng thái</TableHead>
                <TableHead className="w-20 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></TableCell></TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">Không có sản phẩm nào</TableCell></TableRow>
              ) : (
                data?.data.map((p: Product) => (
                  <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-mono text-xs text-slate-500">{p.productCode}</TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-900">{p.name}</p>
                      {p.nameEn && <p className="text-xs text-slate-400">{p.nameEn}</p>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{p.hsCode ?? '—'}</TableCell>
                    <TableCell className="text-sm text-slate-600">{p.category?.name ?? '—'}</TableCell>
                    <TableCell className="text-sm text-slate-600">{p.baseUnit?.code ?? '—'}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE[p.status].class}>{STATUS_BADGE[p.status].label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="w-8 h-8 cursor-pointer" onClick={() => router.push(`/products/${p.id}`)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-red-400 hover:text-red-500 cursor-pointer" onClick={() => setDeleteTarget(p)}>
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
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">Hiển thị {(page - 1) * 20 + 1}–{Math.min(page * 20, data.meta.total)} / {data.meta.total} sản phẩm</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="cursor-pointer">Trước</Button>
              <Button size="sm" variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)} className="cursor-pointer">Sau</Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>Xóa sản phẩm <strong>{deleteTarget?.name}</strong>?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Hủy</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
