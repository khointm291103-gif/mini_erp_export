export enum UserRole {
  ADMIN = 'admin',
  PURCHASING = 'purchasing',
  PURCHASING_MANAGER = 'purchasing_manager',
  SALES = 'sales',
  ACCOUNTANT = 'accountant',
  LOGISTICS = 'logistics',
  WAREHOUSE = 'warehouse',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum VendorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED',
}

export enum PaymentTerms {
  IMMEDIATE = 'IMMEDIATE',
  NET_30 = 'NET_30',
  NET_60 = 'NET_60',
  NET_90 = 'NET_90',
  CUSTOM = 'CUSTOM',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
}
