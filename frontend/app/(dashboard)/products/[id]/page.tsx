'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/products/product-form';
import { productsApi } from '@/lib/api/products';
import type { ProductStatus } from '@/lib/types/product';

const STATUS_BADGE: Record<ProductStatus, { label: string; class: string }> = {
  ACTIVE: { label: 'Hoạt động', class: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', class: 'bg-slate-100 text-slate-600' },
  DISCONTINUED: { label: 'Ngừng SX', class: 'bg-red-100 text-red-600' },
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  if (!product) return <div className="text-center py-16 text-slate-500">Không tìm thấy sản phẩm <Button variant="link" onClick={() => router.push('/products')}>Quay lại</Button></div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
          <Link href="/products" className="hover:text-slate-700 transition-colors">Sản phẩm</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900">{product.productCode}</span>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
          <Badge className={STATUS_BADGE[product.status].class}>{STATUS_BADGE[product.status].label}</Badge>
        </div>
        {product.nameEn && <p className="text-sm text-slate-400 mt-0.5">{product.nameEn}</p>}
      </div>

      <ProductForm product={product} />
    </div>
  );
}
