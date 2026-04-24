import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get('DB_HOST', 'localhost'),
  port: config.get<number>('DB_PORT', 5432),
  username: config.get('DB_USERNAME', 'erp_user'),
  password: config.get('DB_PASSWORD', 'erp_pass'),
  database: config.get('DB_DATABASE', 'mini_erp_export'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: config.get('NODE_ENV') !== 'production',
  logging: config.get('NODE_ENV') === 'development',
});
