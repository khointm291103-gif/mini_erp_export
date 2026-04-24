import { VendorForm } from '@/components/vendors/vendor-form';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function NewVendorPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
          <Link href="/vendors" className="hover:text-slate-700 transition-colors">Nhà cung cấp</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900">Thêm mới</span>
        </div>
        <h2 className="text-xl font-semibold text-slate-900">Thêm nhà cung cấp mới</h2>
      </div>
      <VendorForm />
    </div>
  );
}
