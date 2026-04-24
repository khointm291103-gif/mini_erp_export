import { ProductForm } from '@/components/products/product-form';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
          <Link href="/products" className="hover:text-slate-700 transition-colors">Sản phẩm</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900">Thêm mới</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Thêm sản phẩm mới</h2>
      </div>
      <ProductForm />
    </div>
  );
}
