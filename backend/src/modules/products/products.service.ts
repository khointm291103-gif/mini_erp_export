import {
  Injectable, NotFoundException, ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { ProductUnit } from './entities/product-unit.entity';
import { Product } from './entities/product.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductCategory) private categoriesRepo: Repository<ProductCategory>,
    @InjectRepository(ProductUnit) private unitsRepo: Repository<ProductUnit>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  // ─── Categories ───────────────────────────────────────────────────────────

  async createCategory(dto: CreateCategoryDto) {
    if (dto.code) {
      const exists = await this.categoriesRepo.findOne({ where: { code: dto.code } });
      if (exists) throw new ConflictException('CATEGORY_CODE_EXISTS');
    }
    if (dto.parentId) {
      const parent = await this.categoriesRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('PARENT_NOT_FOUND');
      if (parent.parentId) throw new BadRequestException('NESTING_NOT_ALLOWED');
    }

    const code = dto.code ?? (await this.generateCategoryCode());
    const category = this.categoriesRepo.create({ ...dto, code });
    return this.categoriesRepo.save(category);
  }

  async getCategories(activeOnly = true) {
    const where = activeOnly ? { isActive: true, parentId: IsNull() } : { parentId: IsNull() };
    const roots = await this.categoriesRepo.find({
      where,
      relations: ['children'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return roots;
  }

  async getCategoryById(id: string) {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');
    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) throw new BadRequestException('SELF_REFERENCE');
      if (dto.parentId) {
        const parent = await this.categoriesRepo.findOne({ where: { id: dto.parentId } });
        if (!parent) throw new NotFoundException('PARENT_NOT_FOUND');
        if (parent.parentId) throw new BadRequestException('NESTING_NOT_ALLOWED');
      }
    }

    if (dto.isActive === false) {
      const activeProducts = await this.productsRepo.count({ where: { categoryId: id } });
      if (activeProducts > 0) throw new ConflictException('CATEGORY_HAS_ACTIVE_PRODUCTS');
    }

    Object.assign(category, dto);
    return this.categoriesRepo.save(category);
  }

  async deleteCategory(id: string) {
    const category = await this.categoriesRepo.findOne({ where: { id }, relations: ['children'] });
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    const activeProducts = await this.productsRepo.count({ where: { categoryId: id } });
    if (activeProducts > 0) throw new ConflictException('CATEGORY_HAS_ACTIVE_PRODUCTS');

    const activeChildren = category.children?.filter(c => c.isActive) ?? [];
    if (activeChildren.length > 0) throw new ConflictException('CATEGORY_HAS_ACTIVE_CHILDREN');

    category.isActive = false;
    await this.categoriesRepo.save(category);
    return { message: `Danh mục ${category.code} đã được vô hiệu hóa.` };
  }

  // ─── Units ────────────────────────────────────────────────────────────────

  async createUnit(dto: CreateUnitDto) {
    const code = dto.code.toUpperCase();
    const exists = await this.unitsRepo.findOne({ where: { code } });
    if (exists) throw new ConflictException('UNIT_CODE_EXISTS');
    const unit = this.unitsRepo.create({ ...dto, code });
    return this.unitsRepo.save(unit);
  }

  async getUnits(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    return this.unitsRepo.find({ where, order: { code: 'ASC' } });
  }

  async updateUnit(id: string, dto: UpdateUnitDto) {
    const unit = await this.unitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('UNIT_NOT_FOUND');
    Object.assign(unit, dto);
    return this.unitsRepo.save(unit);
  }

  async deactivateUnit(id: string) {
    const unit = await this.unitsRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException('UNIT_NOT_FOUND');
    const inUse = await this.productsRepo.count({ where: { baseUnitId: id } });
    if (inUse > 0) throw new ConflictException('UNIT_IN_USE');
    unit.isActive = false;
    await this.unitsRepo.save(unit);
    return { message: `Đơn vị tính ${unit.code} đã được vô hiệu hóa.` };
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  async createProduct(dto: CreateProductDto) {
    if (dto.productCode) {
      const exists = await this.productsRepo.findOne({ where: { productCode: dto.productCode } });
      if (exists) throw new ConflictException('PRODUCT_CODE_EXISTS');
    }

    const category = await this.categoriesRepo.findOne({ where: { id: dto.categoryId, isActive: true } });
    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    const unit = await this.unitsRepo.findOne({ where: { id: dto.baseUnitId, isActive: true } });
    if (!unit) throw new NotFoundException('UNIT_NOT_FOUND');

    if (dto.grossWeight && dto.netWeight && dto.grossWeight < dto.netWeight) {
      throw new BadRequestException('WEIGHT_INVALID');
    }

    const productCode = dto.productCode ?? (await this.generateProductCode());
    const product = this.productsRepo.create({ ...dto, productCode });
    return this.productsRepo.save(product);
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 20, search, categoryId, status } = query;
    const qb = this.productsRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.baseUnit', 'baseUnit')
      .where('p.deleted_at IS NULL');

    if (search) {
      qb.andWhere(
        '(p.name ILIKE :s OR p.name_en ILIKE :s OR p.product_code ILIKE :s OR p.hs_code ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (categoryId) qb.andWhere('p.category_id = :categoryId', { categoryId });
    if (status) qb.andWhere('p.status = :status', { status });

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit)
      .orderBy('p.created_at', 'DESC').getMany();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: ['category', 'baseUnit'],
    });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');

    if (dto.categoryId) {
      const cat = await this.categoriesRepo.findOne({ where: { id: dto.categoryId, isActive: true } });
      if (!cat) throw new NotFoundException('CATEGORY_NOT_FOUND');
    }
    if (dto.baseUnitId) {
      const unit = await this.unitsRepo.findOne({ where: { id: dto.baseUnitId, isActive: true } });
      if (!unit) throw new NotFoundException('UNIT_NOT_FOUND');
    }

    const gross = dto.grossWeight ?? product.grossWeight;
    const net = dto.netWeight ?? product.netWeight;
    if (gross && net && gross < net) throw new BadRequestException('WEIGHT_INVALID');

    Object.assign(product, dto);
    return this.productsRepo.save(product);
  }

  async softDelete(id: string) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('PRODUCT_NOT_FOUND');
    await this.productsRepo.softDelete(id);
    return { message: `Sản phẩm ${product.productCode} đã được xóa.`, deletedAt: new Date() };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async generateCategoryCode(): Promise<string> {
    const last = await this.categoriesRepo
      .createQueryBuilder('c')
      .select('MAX(c.code)', 'max')
      .where("c.code LIKE 'CAT-%'")
      .getRawOne();
    const num = last?.max ? parseInt(last.max.replace('CAT-', ''), 10) + 1 : 1;
    return `CAT-${String(num).padStart(3, '0')}`;
  }

  private async generateProductCode(): Promise<string> {
    const last = await this.productsRepo
      .createQueryBuilder('p')
      .select('MAX(p.product_code)', 'max')
      .where("p.product_code LIKE 'PRD-%'")
      .getRawOne();
    const num = last?.max ? parseInt(last.max.replace('PRD-', ''), 10) + 1 : 1;
    return `PRD-${String(num).padStart(4, '0')}`;
  }
}
