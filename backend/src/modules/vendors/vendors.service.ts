import {
  Injectable, NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto } from './dto/vendor.dto';
import { PaymentTerms } from '../../common/enums';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor) private vendorsRepo: Repository<Vendor>,
  ) {}

  async create(dto: CreateVendorDto) {
    if (dto.taxCode) {
      const exists = await this.vendorsRepo.findOne({ where: { taxCode: dto.taxCode } });
      if (exists) throw new ConflictException('VENDOR_TAX_CODE_EXISTS');
    }

    const paymentDueDays = this.resolvePaymentDueDays(dto.paymentTerms, dto.paymentDueDays);

    const vendorCode = await this.generateVendorCode();
    const vendor = this.vendorsRepo.create({ ...dto, vendorCode, paymentDueDays });
    return this.vendorsRepo.save(vendor);
  }

  async findAll(query: VendorQueryDto) {
    const { page = 1, limit = 20, search, status, industry } = query;
    const qb = this.vendorsRepo.createQueryBuilder('v')
      .where('v.deleted_at IS NULL');

    if (search) {
      qb.andWhere(
        '(v.name ILIKE :s OR v.tax_code ILIKE :s OR v.contact_name ILIKE :s OR v.vendor_code ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (status) qb.andWhere('v.status = :status', { status });
    if (industry) qb.andWhere('LOWER(v.industry) = LOWER(:industry)', { industry });

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('v.created_at', 'DESC')
      .getMany();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const vendor = await this.vendorsRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('VENDOR_NOT_FOUND');
    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto) {
    const vendor = await this.vendorsRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('VENDOR_NOT_FOUND');

    if (dto.taxCode && dto.taxCode !== vendor.taxCode) {
      const exists = await this.vendorsRepo
        .createQueryBuilder('v')
        .where('v.tax_code = :taxCode AND v.id != :id', { taxCode: dto.taxCode, id })
        .getOne();
      if (exists) throw new ConflictException('VENDOR_TAX_CODE_EXISTS');
    }

    const paymentTerms = dto.paymentTerms ?? vendor.paymentTerms;
    const paymentDueDays = this.resolvePaymentDueDays(
      paymentTerms,
      dto.paymentDueDays ?? vendor.paymentDueDays,
    );

    Object.assign(vendor, dto, { paymentDueDays });
    return this.vendorsRepo.save(vendor);
  }

  async softDelete(id: string) {
    const vendor = await this.vendorsRepo.findOne({ where: { id } });
    if (!vendor) throw new NotFoundException('VENDOR_NOT_FOUND');
    await this.vendorsRepo.softDelete(id);
    return { message: `Vendor ${vendor.vendorCode} đã được xóa thành công.`, deletedAt: new Date() };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private resolvePaymentDueDays(terms: PaymentTerms, provided?: number): number {
    switch (terms) {
      case PaymentTerms.IMMEDIATE: return 0;
      case PaymentTerms.NET_30: return 30;
      case PaymentTerms.NET_60: return 60;
      case PaymentTerms.NET_90: return 90;
      case PaymentTerms.CUSTOM:
        if (provided === undefined) throw new BadRequestException('MISSING_PAYMENT_DUE_DAYS');
        return provided;
      default: return 0;
    }
  }

  private async generateVendorCode(): Promise<string> {
    const last = await this.vendorsRepo
      .createQueryBuilder('v')
      .select('MAX(v.vendor_code)', 'max')
      .where("v.vendor_code LIKE 'VND-%'")
      .getRawOne();
    const num = last?.max ? parseInt(last.max.replace('VND-', ''), 10) + 1 : 1;
    return `VND-${String(num).padStart(4, '0')}`;
  }
}
