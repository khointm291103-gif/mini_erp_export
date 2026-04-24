'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { VendorForm } from '@/components/vendors/vendor-form';
import { vendorsApi } from '@/lib/api/vendors';
import type { VendorStatus } from '@/lib/types/vendor';

const STATUS_BADGE: Record<VendorStatus, { label: string; class: string }> = {
  ACTIVE: { label: 'Hoạt động', class: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Ngừng', class: 'bg-slate-100 text-slate-600' },
  BLACKLISTED: { label: 'Đen sách', class: 'bg-red-100 text-red-700' },
};

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorsApi.get(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Không tìm thấy nhà cung cấp</p>
        <Button variant="link" onClick={() => router.push('/vendors')}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-1">
          <Link href="/vendors" className="hover:text-slate-700 transition-colors">Nhà cung cấp</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900">{vendor.vendorCode}</span>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-slate-900">{vendor.name}</h2>
          <Badge className={STATUS_BADGE[vendor.status].class}>{STATUS_BADGE[vendor.status].label}</Badge>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Mã NCC</CardTitle></CardHeader>
          <CardContent><p className="font-mono font-medium">{vendor.vendorCode}</p></CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Thanh toán</CardTitle></CardHeader>
          <CardContent><p className="font-medium">{vendor.paymentDueDays > 0 ? `Net ${vendor.paymentDueDays} ngày` : 'Thanh toán ngay'}</p></CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">MST</CardTitle></CardHeader>
          <CardContent><p className="font-mono">{vendor.taxCode ?? '—'}</p></CardContent>
        </Card>
      </div>

      <Separator />

      {/* Edit form */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Chỉnh sửa thông tin</h3>
        <VendorForm vendor={vendor} />
      </div>
    </div>
  );
}
