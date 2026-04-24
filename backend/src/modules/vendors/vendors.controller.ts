import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto, UpdateVendorDto, VendorQueryDto } from './dto/vendor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Vendors')
@ApiBearerAuth('access-token')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PURCHASING)
  @ApiOperation({ summary: 'Tạo nhà cung cấp mới' })
  async create(@Body() dto: CreateVendorDto) {
    const data = await this.vendorsService.create(dto);
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách nhà cung cấp (có filter, phân trang)' })
  async findAll(@Query() query: VendorQueryDto) {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết nhà cung cấp' })
  async findOne(@Param('id') id: string) {
    const data = await this.vendorsService.findOne(id);
    return { data };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PURCHASING)
  @ApiOperation({ summary: 'Cập nhật nhà cung cấp' })
  async update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    const data = await this.vendorsService.update(id, dto);
    return { data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa nhà cung cấp (soft delete, admin only)' })
  async softDelete(@Param('id') id: string) {
    const data = await this.vendorsService.softDelete(id);
    return { data };
  }
}
