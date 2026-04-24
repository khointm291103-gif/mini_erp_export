# Frontend Implementation Plan — Mini ERP Export Trading

> Plan triển khai giao diện web cho toàn bộ Phase 1 APIs đã build.

---

## Tech Stack

| Thành phần | Công nghệ | Lý do |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR/CSR linh hoạt, routing built-in, TypeScript |
| UI Library | **shadcn/ui** + Tailwind CSS | Enterprise look, accessible, customizable |
| State & Fetching | **TanStack Query v5** | Cache, loading/error, refetch tự động |
| Form | **React Hook Form** + **Zod** | Validation schema đồng bộ với backend DTO |
| HTTP Client | **Axios** + interceptors | Auto-attach JWT, handle 401 redirect |
| Icons | **Lucide React** | Consistent SVG, lightweight |
| Table | **TanStack Table v8** | Sorting, filter, pagination phía client |
| Notifications | **Sonner** (toast) | Light, accessible toasts |

---

## Design System

Dựa trên kết quả phân tích cho B2B internal ERP tool:

### Colors

| Role | Hex | Tailwind |
|---|---|---|
| Primary | `#0F172A` | `slate-900` |
| Secondary | `#334155` | `slate-700` |
| CTA / Action | `#0369A1` | `sky-700` |
| Background | `#F8FAFC` | `slate-50` |
| Text | `#020617` | `slate-950` |
| Muted text | `#475569` | `slate-600` |
| Border | `#E2E8F0` | `slate-200` |
| Success | `#16A34A` | `green-600` |
| Danger | `#DC2626` | `red-600` |
| Warning | `#D97706` | `amber-600` |

### Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
```

- **Heading**: `Fira Code` — technical, precise, dashboard feel
- **Body**: `Fira Sans` — readable, professional
- **Monospace data** (IDs, codes, prices): `Fira Code`

### Style

**Soft UI Evolution** — improved shadows, subtle depth, WCAG AA+, modern 200–300ms transitions.

---

## Cấu trúc thư mục

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              # Trang đăng nhập
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + Header layout
│   │   ├── page.tsx                  # Dashboard home (redirect)
│   │   ├── vendors/
│   │   │   ├── page.tsx              # Danh sách vendors
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Chi tiết vendor
│   │   │   └── new/
│   │   │       └── page.tsx          # Tạo vendor mới
│   │   └── products/
│   │       ├── page.tsx              # Danh sách products
│   │       ├── [id]/
│   │       │   └── page.tsx          # Chi tiết product
│   │       ├── new/
│   │       │   └── page.tsx          # Tạo product mới
│   │       ├── categories/
│   │       │   └── page.tsx          # Quản lý danh mục
│   │       └── units/
│   │           └── page.tsx          # Quản lý đơn vị tính
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── breadcrumb.tsx
│   ├── auth/
│   │   └── login-form.tsx
│   ├── vendors/
│   │   ├── vendor-table.tsx
│   │   ├── vendor-form.tsx
│   │   └── vendor-detail.tsx
│   ├── products/
│   │   ├── product-table.tsx
│   │   ├── product-form.tsx
│   │   ├── product-detail.tsx
│   │   ├── category-tree.tsx
│   │   └── unit-list.tsx
│   └── ui/                           # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── axios.ts                  # Axios instance + interceptors
│   │   ├── auth.ts                   # API calls auth
│   │   ├── vendors.ts                # API calls vendors
│   │   └── products.ts               # API calls products
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-vendors.ts
│   │   └── use-products.ts
│   └── types/
│       ├── auth.ts
│       ├── vendor.ts
│       └── product.ts
└── middleware.ts                      # Route protection
```

---

## Thứ tự implement

### Bước 1 — Project Setup & Infrastructure

| # | Việc cần làm |
|---|---|
| 1 | `npx create-next-app@latest frontend --typescript --tailwind --app` |
| 2 | Cài shadcn/ui: `npx shadcn@latest init` |
| 3 | Cài dependencies: `tanstack-query`, `axios`, `react-hook-form`, `zod`, `lucide-react`, `sonner` |
| 4 | Tạo `lib/api/axios.ts` — instance với baseURL, JWT interceptor, 401 auto-redirect |
| 5 | Tạo `middleware.ts` — redirect `/login` nếu chưa có token |
| 6 | Cấu hình Google Fonts (Fira Code + Fira Sans) trong `app/layout.tsx` |
| 7 | Setup TanStack Query Provider trong `app/providers.tsx` |

### Bước 2 — Auth Pages

**Pages:** `(auth)/login/page.tsx`

| Component | Mô tả |
|---|---|
| `LoginForm` | Email + Password, validation Zod, loading state, toast error |
| Token storage | `localStorage` access token, redirect sau login |

**Flow:**
```
/login → POST /api/v1/auth/login → lưu token → redirect /vendors
```

### Bước 3 — Dashboard Layout

**Files:** `(dashboard)/layout.tsx`, `sidebar.tsx`, `header.tsx`

| Element | Mô tả |
|---|---|
| Sidebar | Logo, menu items (Vendors, Products > Categories/Units), user info |
| Header | Breadcrumb, user avatar + dropdown (GET /auth/me, logout) |
| Layout | Fixed sidebar 240px, main content với padding-top cho header |

**Menu structure:**
```
├── Nhà cung cấp        → /vendors
└── Sản phẩm
    ├── Danh sách       → /products
    ├── Danh mục        → /products/categories
    └── Đơn vị tính     → /products/units
```

### Bước 4 — Vendors Module

#### 4a. Danh sách vendors (`/vendors`)

| Element | API | Mô tả |
|---|---|---|
| `VendorTable` | `GET /vendors` | TanStack Table, sort, search, pagination |
| Search bar | query `?search=` | Debounce 300ms |
| Filter status | query `?status=` | Dropdown ACTIVE/INACTIVE/BLACKLISTED |
| Nút "Thêm mới" | — | Link → `/vendors/new` |
| Row actions | — | Xem chi tiết, Sửa (inline), Xóa (confirm dialog) |

#### 4b. Tạo / Sửa vendor (`/vendors/new`, `/vendors/[id]`)

| Element | API | Mô tả |
|---|---|---|
| `VendorForm` | `POST /vendors` hoặc `PATCH /vendors/:id` | React Hook Form + Zod |
| Các field | — | name, taxCode, address, city, contact*, paymentTerms, bank* |
| paymentTerms | — | Select enum, hiện field `paymentDueDays` khi chọn CUSTOM |
| Submit | — | Loading button, toast success/error |

#### 4c. Chi tiết vendor (`/vendors/[id]`)

| Section | API | Mô tả |
|---|---|---|
| Header card | `GET /vendors/:id` | vendorCode, name, status badge, contact |
| Thông tin tab | — | Địa chỉ, thanh toán, ngân hàng, ghi chú |
| Actions | `DELETE /vendors/:id` | Nút Sửa + Xóa với confirm dialog |

### Bước 5 — Products Module

#### 5a. Quản lý danh mục (`/products/categories`)

| Element | API | Mô tả |
|---|---|---|
| `CategoryTree` | `GET /products/categories` | Hiển thị dạng cây accordion (cha > con) |
| Tạo mới | `POST /products/categories` | Inline form hoặc slide-over panel |
| Sửa | `PATCH /products/categories/:id` | Inline edit |
| Xóa | `DELETE /products/categories/:id` | Confirm dialog |

#### 5b. Quản lý đơn vị tính (`/products/units`)

| Element | API | Mô tả |
|---|---|---|
| Danh sách đơn giản | `GET /products/units` | Table nhỏ, không phân trang |
| Tạo mới | `POST /products/units` | Form modal nhỏ |
| Sửa | `PATCH /products/units/:id` | Inline edit |

#### 5c. Danh sách sản phẩm (`/products`)

| Element | API | Mô tả |
|---|---|---|
| `ProductTable` | `GET /products` | TanStack Table, pagination server-side |
| Search | query `?search=` | Debounce 300ms |
| Filter category | query `?categoryId=` | Dropdown lấy từ GET /categories |
| Filter status | query `?status=` | ACTIVE/INACTIVE/DISCONTINUED |
| Nút "Thêm mới" | — | Link → `/products/new` |
| Row actions | — | Xem chi tiết, Sửa, Xóa |

#### 5d. Tạo / Sửa sản phẩm (`/products/new`, `/products/[id]`)

| Section | Mô tả |
|---|---|
| Thông tin cơ bản | name, nameEn, category (select), unit (select), hsCode |
| Thông số đóng gói | netWeight, grossWeight, cbm, dimensions, pcsPerCarton |
| Giá | defaultPurchasePriceVnd, defaultSalePrice, defaultCurrency |
| Khác | defaultVendor (select), tags (tag input), notes |

#### 5e. Chi tiết sản phẩm (`/products/[id]`)

| Section | Mô tả |
|---|---|
| Header card | productCode, name, nameEn, status badge |
| Thông số | hsCode, weight, cbm, dimensions dạng grid |
| Giá | purchasePrice (VND), salePrice (USD/EUR) |
| Nhà cung cấp | defaultVendor info card |

---

## Axios Interceptor Setup

```typescript
// lib/api/axios.ts
const api = axios.create({ baseURL: 'http://localhost:3001/api/v1' });

// Request: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

---

## UX Guidelines áp dụng

| Nguyên tắc | Áp dụng |
|---|---|
| Submit feedback | Loading spinner trên button khi đang gọi API |
| Form labels | Tất cả input có `<label>` — không dùng placeholder làm label |
| Table overflow | `overflow-x-auto` wrapper cho bảng trên mobile |
| Sticky nav | `pt-16` cho main content (header height) |
| Cursor pointer | Tất cả card/button/row có `cursor-pointer` |
| Transitions | `transition-colors duration-200` trên hover |
| Error feedback | Toast error + highlight field lỗi từ response 400 |
| Confirm delete | Dialog xác nhận trước khi DELETE |
| Breadcrumb | Hiển thị trên trang detail và form tạo mới |

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `< 768px` | Sidebar ẩn, hamburger menu, table → card list |
| `768px–1024px` | Sidebar collapsed (icon only) |
| `> 1024px` | Sidebar full 240px |

---

## Tổng kết pages

| Page | Route | APIs dùng |
|---|---|---|
| Login | `/login` | `POST /auth/login` |
| Danh sách vendor | `/vendors` | `GET /vendors` |
| Tạo vendor | `/vendors/new` | `POST /vendors` |
| Chi tiết / Sửa vendor | `/vendors/[id]` | `GET /vendors/:id`, `PATCH /vendors/:id`, `DELETE /vendors/:id` |
| Danh sách sản phẩm | `/products` | `GET /products`, `GET /products/categories` |
| Tạo sản phẩm | `/products/new` | `POST /products`, `GET /products/categories`, `GET /products/units` |
| Chi tiết / Sửa sản phẩm | `/products/[id]` | `GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id` |
| Quản lý danh mục | `/products/categories` | CRUD `/products/categories` |
| Quản lý đơn vị tính | `/products/units` | CRUD `/products/units` |
