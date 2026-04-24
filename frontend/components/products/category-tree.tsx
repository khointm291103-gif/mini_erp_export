'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { productsApi } from '@/lib/api/products';
import type { ProductCategory } from '@/lib/types/product';

function CategoryNode({
  cat,
  onEdit,
  onDelete,
}: {
  cat: ProductCategory;
  onEdit: (c: ProductCategory) => void;
  onDelete: (c: ProductCategory) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 group transition-colors">
        <button
          onClick={() => setOpen(!open)}
          className="w-5 h-5 flex items-center justify-center cursor-pointer text-slate-400"
        >
          {hasChildren ? (open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <span className="w-4" />}
        </button>
        <span className="font-mono text-xs text-slate-400 w-20">{cat.code}</span>
        <span className="flex-1 text-sm font-medium text-slate-800">{cat.name}</span>
        {cat.nameEn && <span className="text-xs text-slate-400">{cat.nameEn}</span>}
        {!cat.isActive && <Badge className="bg-slate-100 text-slate-500 text-xs">Ẩn</Badge>}
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
          <Button size="icon" variant="ghost" className="w-7 h-7 cursor-pointer" onClick={() => onEdit(cat)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-500 cursor-pointer" onClick={() => onDelete(cat)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {hasChildren && open && (
        <div className="ml-6 border-l border-slate-100">
          {cat.children!.map((child) => (
            <CategoryNode key={child.id} cat={child} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree() {
  const qc = useQueryClient();
  const [editTarget, setEditTarget] = useState<ProductCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', nameEn: '', parentId: '' });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', false],
    queryFn: () => productsApi.categories(false),
  });

  const createMutation = useMutation({
    mutationFn: productsApi.createCategory,
    onSuccess: () => { toast.success('Tạo danh mục thành công'); qc.invalidateQueries({ queryKey: ['categories'] }); setShowForm(false); setFormData({ name: '', nameEn: '', parentId: '' }); },
    onError: () => toast.error('Có lỗi xảy ra'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<ProductCategory> }) => productsApi.updateCategory(id, dto),
    onSuccess: () => { toast.success('Cập nhật thành công'); qc.invalidateQueries({ queryKey: ['categories'] }); setEditTarget(null); },
    onError: () => toast.error('Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteCategory(id),
    onSuccess: () => { toast.success('Xóa danh mục thành công'); qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null); },
    onError: () => toast.error('Không thể xóa danh mục (có thể đang có sản phẩm)'),
  });

  // Flatten for select
  const allCategories: ProductCategory[] = [];
  const flatten = (cats: ProductCategory[]) => cats.forEach(c => { allCategories.push(c); if (c.children) flatten(c.children); });
  flatten(categories);
  const roots = allCategories.filter(c => !c.parentId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{allCategories.length} danh mục</p>
        <Button size="sm" className="bg-sky-700 hover:bg-sky-800 cursor-pointer" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Thêm danh mục
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-2">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : categories.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Chưa có danh mục nào</p>
        ) : (
          categories.map((cat) => (
            <CategoryNode key={cat.id} cat={cat} onEdit={(c) => setEditTarget(c)} onDelete={(c) => setDeleteTarget(c)} />
          ))
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm danh mục</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tên danh mục *</Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Thủy sản đông lạnh" />
            </div>
            <div className="space-y-1.5">
              <Label>Tên tiếng Anh</Label>
              <Input value={formData.nameEn} onChange={e => setFormData(p => ({ ...p, nameEn: e.target.value }))} placeholder="Frozen Seafood" />
            </div>
            <div className="space-y-1.5">
              <Label>Danh mục cha</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.parentId}
                onChange={e => setFormData(p => ({ ...p, parentId: e.target.value }))}
              >
                <option value="">— Không có —</option>
                {roots.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
            <Button className="bg-sky-700 hover:bg-sky-800 cursor-pointer" disabled={!formData.name || createMutation.isPending}
              onClick={() => createMutation.mutate({ name: formData.name, nameEn: formData.nameEn || undefined, parentId: formData.parentId || undefined } as Partial<ProductCategory>)}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Tạo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Sửa danh mục</DialogTitle></DialogHeader>
          {editTarget && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Tên danh mục *</Label>
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

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>Xóa danh mục <strong>{deleteTarget?.name}</strong>? Danh mục đang có sản phẩm sẽ không thể xóa.</DialogDescription>
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
