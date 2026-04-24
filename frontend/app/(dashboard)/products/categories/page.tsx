import { CategoryTree } from '@/components/products/category-tree';

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Danh mục sản phẩm</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý cây danh mục sản phẩm</p>
      </div>
      <CategoryTree />
    </div>
  );
}
