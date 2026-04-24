import { VendorTable } from '@/components/vendors/vendor-table';

export default function VendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Nhà cung cấp</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý danh sách nhà cung cấp</p>
      </div>
      <VendorTable />
    </div>
  );
}
