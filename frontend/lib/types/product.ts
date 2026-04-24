export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// Types: Product
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  parentId?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  children?: ProductCategory[];
}

export interface ProductUnit {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  productCode: string;
  name: string;
  nameEn?: string;
  descriptionEn?: string;
  category: { id: string; name: string; code: string };
  baseUnit: { id: string; code: string; name: string };
  hsCode?: string;
  netWeight?: number;
  grossWeight?: number;
  cbm?: number;
  dimensionL?: number;
  dimensionW?: number;
  dimensionH?: number;
  pcsPerCarton?: number;
  defaultPurchasePriceVnd?: number;
  defaultCurrency: string;
  defaultSalePrice?: number;
  defaultVendorId?: string;
  status: ProductStatus;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  productCode?: string;
  name: string;
  nameEn?: string;
  descriptionEn?: string;
  categoryId: string;
  baseUnitId: string;
  hsCode?: string;
  netWeight?: number;
  grossWeight?: number;
  cbm?: number;
  dimensionL?: number;
  dimensionW?: number;
  dimensionH?: number;
  pcsPerCarton?: number;
  defaultPurchasePriceVnd?: number;
  defaultCurrency?: string;
  defaultSalePrice?: number;
  defaultVendorId?: string;
  tags?: string[];
  notes?: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
}
