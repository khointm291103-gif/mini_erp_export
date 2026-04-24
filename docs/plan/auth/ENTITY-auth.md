# Entity Design — Auth Module

## Mô tả
Thiết kế database schema cho module Auth gồm 2 bảng: `users` và `user_refresh_tokens`.

---

## Bảng `users`

| Column | TypeORM type | Nullable | Mô tả |
|---|---|---|---|
| `id` | uuid, PK | No | Auto-generated UUID |
| `email` | varchar(150), unique | No | Email đăng nhập |
| `passwordHash` | varchar(255) | No | Bcrypt hash, saltRounds=10 |
| `fullName` | varchar(150) | No | Họ tên đầy đủ |
| `role` | enum `UserRole` | No | Vai trò trong hệ thống |
| `phone` | varchar(30) | Yes | Số điện thoại |
| `department` | varchar(100) | Yes | Phòng ban |
| `status` | enum `UserStatus` | No | Trạng thái tài khoản, default `ACTIVE` |
| `mustChangePassword` | boolean | No | Bắt buộc đổi mật khẩu lần đăng nhập tiếp, default `false` |
| `lastLoginAt` | timestamptz | Yes | Lần đăng nhập gần nhất |
| `createdAt` | timestamptz | No | Tự động |
| `updatedAt` | timestamptz | No | Tự động |
| `deletedAt` | timestamptz | Yes | Soft delete |

### Enums

```typescript
enum UserRole {
  ADMIN = 'admin',
  PURCHASING = 'purchasing',
  PURCHASING_MANAGER = 'purchasing_manager',
  SALES = 'sales',
  ACCOUNTANT = 'accountant',
  LOGISTICS = 'logistics',
  WAREHOUSE = 'warehouse',
}

enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}
```

---

## Bảng `user_refresh_tokens`

| Column | TypeORM type | Nullable | Mô tả |
|---|---|---|---|
| `id` | uuid, PK | No | Auto-generated UUID |
| `userId` | uuid, FK → users | No | Chủ sở hữu token |
| `tokenHash` | varchar(255) | No | SHA-256 hash của refresh token (không lưu plain text) |
| `userAgent` | text | Yes | Browser/device info từ request header |
| `ipAddress` | varchar(45) | Yes | IP address khi login (hỗ trợ IPv6) |
| `expiresAt` | timestamptz | No | Thời điểm hết hạn (login time + 7d) |
| `createdAt` | timestamptz | No | Thời điểm tạo (= thời điểm login) |

### Index

- `INDEX (userId)` — query nhanh tất cả sessions của 1 user
- `INDEX (tokenHash)` — lookup nhanh khi verify refresh token
- `INDEX (expiresAt)` — cleanup job xóa tokens hết hạn

---

## Ma Trận Phân Quyền (RBAC)

| API | admin | purchasing_manager | purchasing | sales | accountant | logistics | warehouse |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/logout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/logout-all | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /auth/me | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| PATCH /auth/me | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/change-password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /auth/register | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /auth/users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /auth/users/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| PATCH /auth/users/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| DELETE /auth/users/:id | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| POST /auth/reset-password | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GET /auth/users/:id/sessions | ✅ | self | self | self | self | self | self |
| DELETE /auth/users/:id/sessions/:sid | ✅ | self | self | self | self | self | self |

> `self` = chỉ được thao tác trên sessions của chính mình.

---

## File Layout Implementation

```
backend/src/modules/auth/
  entities/
    user.entity.ts
    user-refresh-token.entity.ts
  dto/
    login.dto.ts
    register.dto.ts
    change-password.dto.ts
    reset-password.dto.ts
    update-user.dto.ts
    update-me.dto.ts
  strategies/
    jwt.strategy.ts          ← Passport JWT strategy
  guards/
    jwt-auth.guard.ts        ← Wraps AuthGuard('jwt')
    roles.guard.ts           ← Kiểm tra role từ @Roles() decorator
  decorators/
    roles.decorator.ts       ← @Roles('admin', 'purchasing')
    current-user.decorator.ts ← @CurrentUser() lấy user từ request
  auth.controller.ts
  auth.service.ts
  users.controller.ts        ← /auth/users/* endpoints
  users.service.ts
  auth.module.ts
```

---

## JWT Strategy Config

```typescript
// jwt.strategy.ts
validate(payload: JwtPayload) {
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
```

- `JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '15m' } })`
- Access token: `15m`
- Refresh token: `7d`, lưu `SHA-256(token)` vào DB

---

## Ghi chú implementation

- Dùng `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)` trên controller.
- `JwtAuthGuard` extends `AuthGuard('jwt')` — tự động extract Bearer token từ header.
- `RolesGuard` đọc metadata từ `@Roles()` decorator, so sánh với `request.user.role`.
- Không lưu plain refresh token — lưu `crypto.createHash('sha256').update(token).digest('hex')`.
- Cleanup job (cron): xóa `user_refresh_tokens` có `expiresAt < NOW()` mỗi ngày.
