import api from './axios';
import type { Vendor, CreateVendorDto, UpdateVendorDto, VendorQuery, PaginatedResponse } from '../types/vendor';

export const vendorsApi = {
  list: async (query: VendorQuery = {}): Promise<PaginatedResponse<Vendor>> => {
    const res = await api.get<PaginatedResponse<Vendor>>('/vendors', { params: query });
    return res.data;
  },
  get: async (id: string): Promise<Vendor> => {
    const res = await api.get<{ data: Vendor }>(`/vendors/${id}`);
    return res.data.data;
  },
  create: async (dto: CreateVendorDto): Promise<Vendor> => {
    const res = await api.post<{ data: Vendor }>('/vendors', dto);
    return res.data.data;
  },
  update: async (id: string, dto: UpdateVendorDto): Promise<Vendor> => {
    const res = await api.patch<{ data: Vendor }>(`/vendors/${id}`, dto);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`);
  },
};
