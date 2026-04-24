import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductUnit } from './product-unit.entity';
import { ProductStatus } from '../../../common/enums';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_code', length: 30, unique: true })
  productCode: string;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'name_en', length: 200, nullable: true })
  nameEn: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => ProductCategory)
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @Column({ name: 'base_unit_id' })
  baseUnitId: string;

  @ManyToOne(() => ProductUnit)
  @JoinColumn({ name: 'base_unit_id' })
  baseUnit: ProductUnit;

  @Column({ name: 'hs_code', length: 20, nullable: true })
  hsCode: string;

  @Column({ name: 'net_weight', type: 'decimal', precision: 12, scale: 4, nullable: true })
  netWeight: number;

  @Column({ name: 'gross_weight', type: 'decimal', precision: 12, scale: 4, nullable: true })
  grossWeight: number;

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  cbm: number;

  @Column({ name: 'dimension_l', type: 'decimal', precision: 10, scale: 2, nullable: true })
  dimensionL: number;

  @Column({ name: 'dimension_w', type: 'decimal', precision: 10, scale: 2, nullable: true })
  dimensionW: number;

  @Column({ name: 'dimension_h', type: 'decimal', precision: 10, scale: 2, nullable: true })
  dimensionH: number;

  @Column({ name: 'pcs_per_carton', nullable: true })
  pcsPerCarton: number;

  @Column({ name: 'default_purchase_price_vnd', type: 'decimal', precision: 18, scale: 4, nullable: true })
  defaultPurchasePriceVnd: number;

  @Column({ name: 'default_currency', length: 3, default: 'USD' })
  defaultCurrency: string;

  @Column({ name: 'default_sale_price', type: 'decimal', precision: 18, scale: 4, nullable: true })
  defaultSalePrice: number;

  @Column({ name: 'default_vendor_id', nullable: true })
  defaultVendorId: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
