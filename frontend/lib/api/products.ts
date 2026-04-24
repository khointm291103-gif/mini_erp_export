import api from './axios';
import type {
  Product, ProductCategory, ProductUnit,
  CreateProductDto, UpdateProductDto, ProductQuery,
  PaginatedResponse,
} from '../types/product';

export const productsApi = {
  // Products
  list: async (query: ProductQuery = {}): Promise<PaginatedResponse<Product>> => {
    const res = await api.get<PaginatedResponse<Product>>('/products', { params: query });
    return res.data;
  },
  get: async (id: string): Promise<Product> => {
    const res = await api.get<{ data: Product }>(`/products/${id}`);
    return res.data.data;
  },
  create: async (dto: CreateProductDto): Promise<Product> => {
    const res = await api.post<{ data: Product }>('/products', dto);
    return res.data.data;
  },
  update: async (id: string, dto: UpdateProductDto): Promise<Product> => {
    const res = await api.patch<{ data: Product }>(`/products/${id}`, dto);
    return res.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Categories
  categories: async (activeOnly = true): Promise<ProductCategory[]> => {
    const res = await api.get<{ data: ProductCategory[] }>('/products/categories', {
      params: { activeOnly },
    });
    return res.data.data;
  },
  createCategory: async (dto: Partial<ProductCategory>): Promise<ProductCategory> => {
    const res = await api.post<{ data: ProductCategory }>('/products/categories', dto);
    return res.data.data;
  },
  updateCategory: async (id: string, dto: Partial<ProductCategory>): Promise<ProductCategory> => {
    const res = await api.patch<{ data: ProductCategory }>(`/products/categories/${id}`, dto);
    return res.data.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/products/categories/${id}`);
  },

  // Units
  units: async (activeOnly = true): Promise<ProductUnit[]> => {
    const res = await api.get<{ data: ProductUnit[] }>('/products/units', {
      params: { activeOnly },
    });
    return res.data.data;
  },
  createUnit: async (dto: Partial<ProductUnit>): Promise<ProductUnit> => {
    const res = await api.post<{ data: ProductUnit }>('/products/units', dto);
    return res.data.data;
  },
  updateUnit: async (id: string, dto: Partial<ProductUnit>): Promise<ProductUnit> => {
    const res = await api.patch<{ data: ProductUnit }>(`/products/units/${id}`, dto);
    return res.data.data;
  },
};
