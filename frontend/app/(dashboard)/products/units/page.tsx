import { UnitList } from '@/components/products/unit-list';

export default function UnitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Đơn vị tính</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý đơn vị tính sản phẩm (KG, Thùng, Cái...)</p>
      </div>
      <UnitList />
    </div>
  );
}
