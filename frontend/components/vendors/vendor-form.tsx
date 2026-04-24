'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { vendorsApi } from '@/lib/api/vendors';
import type { Vendor, CreateVendorDto, PaymentTerms } from '@/lib/types/vendor';

const vendorSchema = z.object({
  name: z.string().min(1, 'Tên nhà cung cấp là bắt buộc').max(200),
  taxCode: z.string().max(20).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  contactName: z.string().max(150).optional().or(z.literal('')),
  contactPhone: z.string().max(30).optional().or(z.literal('')),
  contactEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  paymentTerms: z.enum(['IMMEDIATE', 'NET_30', 'NET_60', 'NET_90', 'CUSTOM']),
  paymentDueDays: z.string().optional(),
  bankName: z.string().optional().or(z.literal('')),
  bankAccountNumber: z.string().optional().or(z.literal('')),
  bankBranch: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface Props {
  vendor?: Vendor;
}

const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  IMMEDIATE: 'Thanh toán ngay',
  NET_30: 'Net 30 ngày',
  NET_60: 'Net 60 ngày',
  NET_90: 'Net 90 ngày',
  CUSTOM: 'Tùy chỉnh',
};

export function VendorForm({ vendor }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor
      ? {
          name: vendor.name,
          taxCode: vendor.taxCode ?? '',
          address: vendor.address ?? '',
          city: vendor.city ?? '',
          contactName: vendor.contactName ?? '',
          contactPhone: vendor.contactPhone ?? '',
          contactEmail: vendor.contactEmail ?? '',
          industry: vendor.industry ?? '',
          paymentTerms: vendor.paymentTerms,
          paymentDueDays: vendor.paymentDueDays != null ? String(vendor.paymentDueDays) : '',
          bankName: vendor.bankName ?? '',
          bankAccountNumber: vendor.bankAccountNumber ?? '',
          bankBranch: vendor.bankBranch ?? '',
          notes: vendor.notes ?? '',
        }
      : { paymentTerms: 'NET_30' },
  });

  const paymentTerms = watch('paymentTerms');

  const onSubmit = async (data: VendorFormData) => {
    setLoading(true);
    try {
      // Clean empty strings, convert paymentDueDays to number
      const raw: Record<string, unknown> = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      );
      if (raw.paymentDueDays) raw.paymentDueDays = Number(raw.paymentDueDays);
      const dto = raw as unknown as CreateVendorDto;

      if (vendor) {
        await vendorsApi.update(vendor.id, dto);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await vendorsApi.create(dto);
        toast.success('Tạo nhà cung cấp thành công');
      }
      router.push('/vendors');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg === 'VENDOR_TAX_CODE_EXISTS' ? 'Mã số thuế đã tồn tại' : (msg ?? 'Có lỗi xảy ra'));
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
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="name">Tên nhà cung cấp <span className="text-red-500">*</span></Label>
            <Input id="name" {...register('name')} placeholder="Công ty TNHH Thủy Sản..." />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taxCode">Mã số thuế</Label>
            <Input id="taxCode" {...register('taxCode')} placeholder="0123456789" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">Ngành nghề</Label>
            <Input id="industry" {...register('industry')} placeholder="Thủy sản" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" {...register('address')} placeholder="123 Nguyễn Huệ, Q.1, TP.HCM" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Tỉnh / Thành phố</Label>
            <Input id="city" {...register('city')} placeholder="Hồ Chí Minh" />
          </div>
        </CardContent>
      </Card>

      {/* Liên hệ */}
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin liên hệ</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactName">Người liên hệ</Label>
            <Input id="contactName" {...register('contactName')} placeholder="Nguyễn Văn A" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">Số điện thoại</Label>
            <Input id="contactPhone" {...register('contactPhone')} placeholder="0901234567" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" type="email" {...register('contactEmail')} placeholder="contact@vendor.vn" />
            {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Thanh toán */}
      <Card>
        <CardHeader><CardTitle className="text-base">Điều khoản thanh toán</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Hình thức thanh toán <span className="text-red-500">*</span></Label>
            <Select
              value={paymentTerms}
              onValueChange={(v: string | null) => v && setValue('paymentTerms', v as PaymentTerms)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_TERMS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {paymentTerms === 'CUSTOM' && (
            <div className="space-y-1.5">
              <Label htmlFor="paymentDueDays">Số ngày <span className="text-red-500">*</span></Label>
              <Input id="paymentDueDays" type="number" {...register('paymentDueDays')} placeholder="45" min={0} max={365} />
              {errors.paymentDueDays && <p className="text-xs text-red-500">{errors.paymentDueDays.message}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ngân hàng */}
      <Card>
        <CardHeader><CardTitle className="text-base">Thông tin ngân hàng</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Ngân hàng</Label>
            <Input id="bankName" {...register('bankName')} placeholder="Vietcombank" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankAccountNumber">Số tài khoản</Label>
            <Input id="bankAccountNumber" {...register('bankAccountNumber')} placeholder="1234567890" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankBranch">Chi nhánh</Label>
            <Input id="bankBranch" {...register('bankBranch')} placeholder="Chi nhánh TP.HCM" />
          </div>
        </CardContent>
      </Card>

      {/* Ghi chú */}
      <Card>
        <CardHeader><CardTitle className="text-base">Ghi chú</CardTitle></CardHeader>
        <CardContent>
          <textarea
            {...register('notes')}
            className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Ghi chú nội bộ..."
          />
        </CardContent>
      </Card>

      <Separator />
      <div className="flex gap-3">
        <Button type="submit" className="bg-sky-700 hover:bg-sky-800" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu...</> : vendor ? 'Cập nhật' : 'Tạo nhà cung cấp'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/vendors')} disabled={loading}>
          Hủy
        </Button>
      </div>
    </form>
  );
}
