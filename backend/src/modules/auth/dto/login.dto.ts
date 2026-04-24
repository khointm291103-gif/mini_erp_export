import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@company.vn' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secure@2026' })
  @IsString()
  password: string;
}
