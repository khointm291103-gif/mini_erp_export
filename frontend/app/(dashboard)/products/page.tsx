import { ProductTable } from '@/components/products/product-table';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Sản phẩm</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý danh mục sản phẩm xuất khẩu</p>
      </div>
      <ProductTable />
    </div>
  );
}
