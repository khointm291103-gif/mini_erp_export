import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'nguyen.mua.hang@company.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secure@2026', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'password must contain uppercase, lowercase and number',
  })
  password: string;

  @ApiProperty({ example: 'Nguyễn Mua Hàng' })
  @IsString()
  @MaxLength(150)
  fullName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PURCHASING })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: '0901234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Phòng Mua Hàng' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}
