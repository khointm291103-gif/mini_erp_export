import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Tạo tài khoản nhân viên (admin only)' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { data };
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập, nhận JWT' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.login(dto);
    return { data };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin user đang đăng nhập' })
  async getMe(@CurrentUser() user: { id: string }) {
    const data = await this.authService.getMe(user.id);
    return { data };
  }
}
