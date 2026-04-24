import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // ─── Categories ───────────────────────────────────────────────────────────

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo danh mục sản phẩm (admin only)' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const data = await this.productsService.createCategory(dto);
    return { data };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Danh sách danh mục (nested tree)' })
  async getCategories(@Query('activeOnly') activeOnly?: string) {
    const data = await this.productsService.getCategories(activeOnly !== 'false');
    return { data };
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Chi tiết danh mục' })
  async getCategoryById(@Param('id') id: string) {
    const data = await this.productsService.getCategoryById(id);
    return { data };
  }

  @Patch('categories/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật danh mục (admin only)' })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const data = await this.productsService.updateCategory(id, dto);
    return { data };
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Vô hiệu hóa danh mục (admin only)' })
  async deleteCategory(@Param('id') id: string) {
    const data = await this.productsService.deleteCategory(id);
    return { data };
  }

  // ─── Units ────────────────────────────────────────────────────────────────

  @Post('units')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo đơn vị tính (admin only)' })
  async createUnit(@Body() dto: CreateUnitDto) {
    const data = await this.productsService.createUnit(dto);
    return { data };
  }

  @Get('units')
  @ApiOperation({ summary: 'Danh sách đơn vị tính' })
  async getUnits(@Query('activeOnly') activeOnly?: string) {
    const data = await this.productsService.getUnits(activeOnly !== 'false');
    return { data };
  }

  @Patch('units/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật đơn vị tính (admin only)' })
  async updateUnit(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    const data = await this.productsService.updateUnit(id, dto);
    return { data };
  }

  @Delete('units/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Vô hiệu hóa đơn vị tính (admin only)' })
  async deactivateUnit(@Param('id') id: string) {
    const data = await this.productsService.deactivateUnit(id);
    return { data };
  }

  // ─── Products ─────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PURCHASING)
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  async createProduct(@Body() dto: CreateProductDto) {
    const data = await this.productsService.createProduct(dto);
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm (có filter, phân trang)' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết sản phẩm' })
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id);
    return { data };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PURCHASING)
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.updateProduct(id, dto);
    return { data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa sản phẩm (soft delete, admin only)' })
  async softDelete(@Param('id') id: string) {
    const data = await this.productsService.softDelete(id);
    return { data };
  }
}
