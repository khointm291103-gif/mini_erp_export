'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { productsApi } from '@/lib/api/products';
import type { Product, CreateProductDto } from '@/lib/types/product';

const productSchema = z.object({
  productCode: z.string().max(30).optional().or(z.literal('')),
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(200),
  nameEn: z.string().max(200).optional().or(z.literal('')),
  descriptionEn: z.string().optional().or(z.literal('')),
  categoryId: z.string().uuid('Vui lòng chọn danh mục'),
  baseUnitId: z.string().uuid('Vui lòng chọn đơn vị tính'),
  hsCode: z.string().max(20).optional().or(z.literal('')),
  netWeight: z.string().optional(),
  grossWeight: z.string().optional(),
  pcsPerCarton: z.string().optional(),
  defaultPurchasePriceVnd: z.string().optional(),
  defaultCurrency: z.string().optional().or(z.literal('')),
  defaultSalePrice: z.string().optional(),
  notes: z.string().optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data: categories = [] } = useQuery({ queryKey: ['categories', true], queryFn: () => productsApi.categories(true) });
  const { data: units = [] } = useQuery({ queryKey: ['units', true], queryFn: () => productsApi.units(true) });

  const flatCats: { id: string; name: string }[] = [];
  const flatten = (cats: typeof categories) => cats.forEach(c => { flatCats.push({ id: c.id, name: c.name }); if (c.children) flatten(c.children); });
  flatten(categories);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      productCode: product.productCode,
      name: product.name,
      nameEn: product.nameEn ?? '',
      descriptionEn: product.descriptionEn ?? '',
      categoryId: product.category.id,
      baseUnitId: product.baseUnit.id,
      hsCode: product.hsCode ?? '',
      netWeight: product.netWeight != null ? String(product.netWeight) : '',
      grossWeight: product.grossWeight != null ? String(product.grossWeight) : '',
      pcsPerCarton: product.pcsPerCarton != null ? String(product.pcsPerCarton) : '',
      defaultPurchasePriceVnd: product.defaultPurchasePriceVnd != null ? String(product.defaultPurchasePriceVnd) : '',
      defaultCurrency: product.defaultCurrency ?? 'USD',
      defaultSalePrice: product.defaultSalePrice != null ? String(product.defaultSalePrice) : '',
      notes: product.notes ?? '',
    } : { defaultCurrency: 'USD' },
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const numFields = ['netWeight', 'grossWeight', 'pcsPerCarton', 'defaultPurchasePriceVnd', 'defaultSalePrice'];
      const dto = Object.fromEntries(
        Object.entries(data)
          .filter(([, v]) => v !== '' && v !== undefined && v !== null)
          .map(([k, v]) => [k, numFields.includes(k) ? Number(v) : v])
      ) as unknown as CreateProductDto;

      if (product) {
        await productsApi.update(product.id, dto);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productsApi.create(dto);
        toast.success('Tạo sản phẩm thành công');
      }
      router.push('/products');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg === 'PRODUCT_CODE_EXISTS' ? 'Mã sản phẩm đã tồn tại' : (msg ?? 'Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Thông tin cơ bản */}
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin cơ bản</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="productCode">Mã sản phẩm</Label>
            <Input id="productCode" {...register('productCode')} placeholder="PRD-0001 (tự động nếu để trống)" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hsCode">HS Code</Label>
            <Input id="hsCode" {...register('hsCode')} placeholder="0306.17.00" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="name">Tên sản phẩm <span className="text-red-500">*</span></Label>
            <Input id="name" {...register('name')} placeholder="Tôm sú đông lạnh" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="nameEn">Tên tiếng Anh</Label>
            <Input id="nameEn" {...register('nameEn')} placeholder="Frozen Black Tiger Shrimp" />
          </div>
          <div className="space-y-1.5">
            <Label>Danh mục <span className="text-red-500">*</span></Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={watch('categoryId') ?? ''}
              onChange={e => setValue('categoryId', e.target.value)}
            >
              <option value="">— Chọn danh mục —</option>
              {flatCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Đơn vị tính <span className="text-red-500">*</span></Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={watch('baseUnitId') ?? ''}
              onChange={e => setValue('baseUnitId', e.target.value)}
            >
              <option value="">— Chọn đơn vị —</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.code} — {u.name}</option>)}
            </select>
            {errors.baseUnitId && <p className="text-xs text-red-500">{errors.baseUnitId.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Thông số */}
      <Card>
        <CardHeader><CardTitle className="text-base">Thông số đóng gói</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="netWeight">KL tịnh (kg)</Label>
            <Input id="netWeight" type="number" step="0.001" {...register('netWeight')} placeholder="1.000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grossWeight">KL tổng (kg)</Label>
            <Input id="grossWeight" type="number" step="0.001" {...register('grossWeight')} placeholder="1.200" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pcsPerCarton">Số lượng/thùng</Label>
            <Input id="pcsPerCarton" type="number" {...register('pcsPerCarton')} placeholder="12" />
          </div>
        </CardContent>
      </Card>

      {/* Giá */}
      <Card>
        <CardHeader><CardTitle className="text-base">Giá tham khảo</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="defaultPurchasePriceVnd">Giá mua (VND)</Label>
            <Input id="defaultPurchasePriceVnd" type="number" {...register('defaultPurchasePriceVnd')} placeholder="150000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultSalePrice">Giá bán</Label>
            <Input id="defaultSalePrice" type="number" step="0.01" {...register('defaultSalePrice')} placeholder="6.50" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultCurrency">Tiền tệ</Label>
            <Input id="defaultCurrency" {...register('defaultCurrency')} placeholder="USD" maxLength={3} />
          </div>
        </CardContent>
      </Card>

      {/* Ghi chú */}
      <Card>
        <CardHeader><CardTitle className="text-base">Ghi chú</CardTitle></CardHeader>
        <CardContent>
          <textarea {...register('notes')} className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Ghi chú nội bộ..." />
        </CardContent>
      </Card>

      <Separator />
      <div className="flex gap-3">
        <Button type="submit" className="bg-sky-700 hover:bg-sky-800" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</> : product ? 'Cập nhật' : 'Tạo sản phẩm'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/products')} disabled={loading}>Hủy</Button>
      </div>
    </form>
  );
}
