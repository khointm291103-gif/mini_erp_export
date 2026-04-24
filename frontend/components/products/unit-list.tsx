'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { productsApi } from '@/lib/api/products';
import type { ProductUnit } from '@/lib/types/product';

export function UnitList() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductUnit | null>(null);
  const [formData, setFormData] = useState({ code: '', name: '', nameEn: '' });

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units', false],
    queryFn: () => productsApi.units(false),
  });

  const createMutation = useMutation({
    mutationFn: productsApi.createUnit,
    onSuccess: () => { toast.success('Tạo đơn vị thành công'); qc.invalidateQueries({ queryKey: ['units'] }); setShowForm(false); setFormData({ code: '', name: '', nameEn: '' }); },
    onError: () => toast.error('Mã đơn vị đã tồn tại'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<ProductUnit> }) => productsApi.updateUnit(id, dto),
    onSuccess: () => { toast.success('Cập nhật thành công'); qc.invalidateQueries({ queryKey: ['units'] }); setEditTarget(null); },
    onError: () => toast.error('Có lỗi xảy ra'),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="bg-sky-700 hover:bg-sky-800 cursor-pointer" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Thêm đơn vị
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-24">Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Tên tiếng Anh</TableHead>
              <TableHead className="w-20 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></TableCell></TableRow>
            ) : units.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-slate-400">Chưa có đơn vị tính nào</TableCell></TableRow>
            ) : (
              units.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-mono font-medium">{u.code}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell className="text-slate-500">{u.nameEn ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button size="icon" variant="ghost" className="w-8 h-8 cursor-pointer" onClick={() => setEditTarget(u)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm đơn vị tính</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Mã đơn vị *</Label>
              <Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="KG" />
            </div>
            <div className="space-y-1.5">
              <Label>Tên *</Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Kilogram" />
            </div>
            <div className="space-y-1.5">
              <Label>Tên tiếng Anh</Label>
              <Input value={formData.nameEn} onChange={e => setFormData(p => ({ ...p, nameEn: e.target.value }))} placeholder="Kilogram" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button className="bg-sky-700 hover:bg-sky-800 cursor-pointer" disabled={!formData.code || !formData.name || createMutation.isPending}
              onClick={() => createMutation.mutate({ code: formData.code, name: formData.name, nameEn: formData.nameEn || undefined } as Partial<ProductUnit>)}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sửa đơn vị tính</DialogTitle></DialogHeader>
          {editTarget && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Mã đơn vị</Label>
                <Input value={editTarget.code} disabled className="bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <Label>Tên *</Label>
                <Input value={editTarget.name} onChange={e => setEditTarget(p => p ? { ...p, name: e.target.value } : p)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tên tiếng Anh</Label>
                <Input value={editTarget.nameEn ?? ''} onChange={e => setEditTarget(p => p ? { ...p, nameEn: e.target.value } : p)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Hủy</Button>
            <Button className="bg-sky-700 hover:bg-sky-800 cursor-pointer" disabled={updateMutation.isPending}
              onClick={() => editTarget && updateMutation.mutate({ id: editTarget.id, dto: { name: editTarget.name, nameEn: editTarget.nameEn } })}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
