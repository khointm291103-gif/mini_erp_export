// Types: Vendor
export type PaymentTerms = 'IMMEDIATE' | 'NET_30' | 'NET_60' | 'NET_90' | 'CUSTOM';
export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  taxCode?: string;
  address?: string;
  city?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  industry?: string;
  paymentTerms: PaymentTerms;
  paymentDueDays: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  status: VendorStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorDto {
  name: string;
  taxCode?: string;
  address?: string;
  city?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  industry?: string;
  paymentTerms: PaymentTerms;
  paymentDueDays?: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  notes?: string;
}

export type UpdateVendorDto = Partial<CreateVendorDto>;

export interface VendorQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: VendorStatus;
  industry?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
