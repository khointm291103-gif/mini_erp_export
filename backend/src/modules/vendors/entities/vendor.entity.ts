import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { PaymentTerms, VendorStatus } from '../../../common/enums';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vendor_code', length: 20, unique: true })
  vendorCode: string;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'tax_code', length: 20, unique: true, nullable: true })
  taxCode: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ name: 'contact_name', length: 150, nullable: true })
  contactName: string;

  @Column({ name: 'contact_phone', length: 30, nullable: true })
  contactPhone: string;

  @Column({ name: 'contact_email', length: 150, nullable: true })
  contactEmail: string;

  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ name: 'payment_terms', type: 'enum', enum: PaymentTerms })
  paymentTerms: PaymentTerms;

  @Column({ name: 'payment_due_days', default: 0 })
  paymentDueDays: number;

  @Column({ name: 'bank_name', length: 150, nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', length: 50, nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'bank_branch', length: 150, nullable: true })
  bankBranch: string;

  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.ACTIVE })
  status: VendorStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
