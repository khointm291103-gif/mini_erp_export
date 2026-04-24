import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { User } from './modules/auth/entities/user.entity';
import { UserRole, UserStatus } from './common/enums';

dotenv.config();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5433),
    username: process.env.DB_USERNAME ?? 'erp_user',
    password: process.env.DB_PASSWORD ?? 'erp_pass',
    database: process.env.DB_DATABASE ?? 'mini_erp_export',
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

  const usersRepo = dataSource.getRepository(User);

  const email = 'admin@company.vn';
  const existing = await usersRepo.findOne({ where: { email } });

  if (existing) {
    console.log(`✓ Admin đã tồn tại: ${email}`);
  } else {
    const passwordHash = await bcrypt.hash('Admin@2026', 10);
    const admin = usersRepo.create({
      email,
      passwordHash,
      fullName: 'System Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      department: 'IT',
    });
    await usersRepo.save(admin);
    console.log('✓ Tạo admin thành công!');
    console.log('  Email   :', email);
    console.log('  Password: Admin@2026');
    console.log('  ⚠️  Nhớ đổi mật khẩu sau khi đăng nhập lần đầu!');
  }

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed thất bại:', err.message);
  process.exit(1);
});
