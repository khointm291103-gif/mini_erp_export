# POST /api/v1/products/units

## Mô tả
Tạo mới một đơn vị tính (Unit of Measure). Đơn vị tính được dùng làm `baseUnit` cho sản phẩm.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `code` | string | ✅ | Mã đơn vị, uppercase, unique, max 20 (vd: `KG`, `PCS`, `CTN`, `MT`) |
| `name` | string | ✅ | Tên đơn vị tiếng Việt, max 100 (vd: Kilogram, Cái, Thùng) |
| `nameEn` | string | ❌ | Tên tiếng Anh (dùng trong hồ sơ xuất khẩu: Kilogram, Piece, Carton) |

**Ví dụ:**
```json
{
  "code": "CTN",
  "name": "Thùng carton",
  "nameEn": "Carton"
}
```

---

## Business Rules

1. `code` tự động chuyển thành uppercase trước khi lưu.
2. `code` phải unique — trả 409 nếu đã tồn tại.
3. `isActive` mặc định `true`.

---

## Response (201 Created)

```json
{
  "data": {
    "id": "uuid-unit-...",
    "code": "CTN",
    "name": "Thùng carton",
    "nameEn": "Carton",
    "isActive": true,
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 409 | UNIT_CODE_EXISTS | `code` đã tồn tại |
| 400 | VALIDATION_ERROR | Thiếu `code` hoặc `name` |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `product_units`
- **Service method**: `ProductsService.createUnit(dto)`
