# Implementation Plan — Mini-ERP Export Trading (Phase 1)

> Chỉ implement các API cốt lõi để hệ thống chạy được với data thật.
> Các tính năng phức tạp (ratings, payables, market prices, export...) để Phase 2.

---

## Tech Stack

- **Framework**: NestJS 11 + TypeScript
- **ORM**: TypeORM 0.3.28
- **Database**: PostgreSQL 16
- **Auth**: JWT (access token 15m) + bcryptjs
- **Validation**: class-validator + class-transformer
- **Base URL**: `/api/v1`

---

## Thứ tự implement

### Bước 1 — Infrastructure

Cần làm trước, các module đều phụ thuộc vào đây.

| # | Việc cần làm | File |
|---|---|---|
| 1 | Cấu hình TypeORM kết nối PostgreSQL | `src/config/database.config.ts` |
| 2 | Cấu hình ConfigModule đọc `.env` | `src/app.module.ts` |
| 3 | Thêm global `ValidationPipe` + prefix `/api/v1` | `src/main.ts` |
| 4 | Tạo `JwtAuthGuard` | `src/common/guards/jwt-auth.guard.ts` |
| 5 | Tạo `RolesGuard` + `@Roles()` decorator | `src/common/guards/roles.guard.ts` |
| 6 | Tạo `@CurrentUser()` decorator | `src/common/decorators/current-user.decorator.ts` |
| 7 | Tạo shared enums (UserRole, UserStatus) | `src/common/enums/index.ts` |

---

### Bước 2 — Auth Module (3 APIs)

| # | Method | Path | Mô tả | Plan file |
|---|---|---|---|---|
| 1 | POST | `/api/v1/auth/register` | Admin tạo tài khoản nhân viên | `plan/auth/POST-auth-register.md` |
| 2 | POST | `/api/v1/auth/login` | Đăng nhập, trả JWT | `plan/auth/POST-auth-login.md` |
| 3 | GET | `/api/v1/auth/me` | Lấy thông tin user đang đăng nhập | `plan/auth/GET-auth-me.md` |

**Entities cần tạo:**
- `users` — xem `plan/auth/ENTITY-auth.md`

> Bỏ `user_refresh_tokens` ở Phase 1 — dùng access token đơn giản, không có refresh.

---

### Bước 3 — Products Module (10 APIs)

> Làm trước Vendors vì `vendor_price_histories` phụ thuộc vào bảng `products`.

#### Categories (5 APIs)

| # | Method | Path | Mô tả | Plan file |
|---|---|---|---|---|
| 4 | POST | `/api/v1/products/categories` | Tạo danh mục | `plan/products/POST-products-categories.md` |
| 5 | GET | `/api/v1/products/categories` | Danh sách danh mục (nested tree) | `plan/products/GET-products-categories.md` |
| 6 | GET | `/api/v1/products/categories/:id` | Chi tiết danh mục | `plan/products/GET-products-categories-id.md` |
| 7 | PATCH | `/api/v1/products/categories/:id` | Cập nhật danh mục | `plan/products/PATCH-products-categories-id.md` |
| 8 | DELETE | `/api/v1/products/categories/:id` | Xóa danh mục | `plan/products/DELETE-products-categories-id.md` |

#### Units (2 APIs — đơn giản, không cần DELETE ở Phase 1)

| # | Method | Path | Mô tả | Plan file |
|---|---|---|---|---|
| 9 | POST | `/api/v1/products/units` | Tạo đơn vị tính | `plan/products/POST-products-units.md` |
| 10 | GET | `/api/v1/products/units` | Danh sách đơn vị tính | `plan/products/GET-products-units.md` |

#### Products (5 APIs)

| # | Method | Path | Mô tả | Plan file |
|---|---|---|---|---|
| 11 | POST | `/api/v1/products` | Tạo sản phẩm | `plan/products/POST-products.md` |
| 12 | GET | `/api/v1/products` | Danh sách sản phẩm | `plan/products/GET-products.md` |
| 13 | GET | `/api/v1/products/:id` | Chi tiết sản phẩm | `plan/products/GET-products-id.md` |
| 14 | PATCH | `/api/v1/products/:id` | Cập nhật sản phẩm | `plan/products/PATCH-products-id.md` |
| 15 | DELETE | `/api/v1/products/:id` | Soft-delete sản phẩm | `plan/products/DELETE-products-id.md` |

**Entities cần tạo:**
- `product_categories`
- `product_units`
- `products`

---

### Bước 4 — Vendors Module (5 APIs)

| # | Method | Path | Mô tả | Plan file |
|---|---|---|---|---|
| 16 | POST | `/api/v1/vendors` | Tạo nhà cung cấp | `plan/vendors/POST-vendors.md` |
| 17 | GET | `/api/v1/vendors` | Danh sách nhà cung cấp | `plan/vendors/GET-vendors.md` |
| 18 | GET | `/api/v1/vendors/:id` | Chi tiết nhà cung cấp | `plan/vendors/GET-vendors-id.md` |
| 19 | PATCH | `/api/v1/vendors/:id` | Cập nhật nhà cung cấp | `plan/vendors/PATCH-vendors-id.md` |
| 20 | DELETE | `/api/v1/vendors/:id` | Soft-delete nhà cung cấp | `plan/vendors/DELETE-vendors-id.md` |

**Entities cần tạo:**
- `vendors`

---

## Tổng kết Phase 1

| Module | APIs |
|---|---|
| Infrastructure | 7 tasks (không phải API) |
| Auth | 3 APIs |
| Products (Categories + Units + Products) | 12 APIs |
| Vendors | 5 APIs |
| **Tổng** | **20 APIs** |

---

## Phase 2 (để sau)

- Auth: logout, refresh token, reset password, user management
- Vendors: price history, ratings, payables/AP, due alerts
- Products: market prices, vendor prices, Excel export
- Purchasing module (PO, GRN)
- Sales module (Contract, Invoice)
- Inventory module
