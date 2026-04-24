# PATCH /api/v1/products/units/:id

## Mô tả
Cập nhật thông tin đơn vị tính. `code` không được thay đổi sau khi tạo (immutable).

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID đơn vị tính |

### Body (JSON) — tất cả optional

| Field | Type | Mô tả |
|---|---|---|
| `name` | string | Tên tiếng Việt |
| `nameEn` | string | Tên tiếng Anh |

---

## Business Rules

1. Trả 404 nếu đơn vị không tồn tại.
2. `code` là immutable — bị ignore nếu gửi lên.
3. Chỉ cập nhật `name` và `nameEn`.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-unit-...",
    "code": "CTN",
    "name": "Thùng carton (xuất khẩu)",
    "nameEn": "Export Carton",
    "isActive": true,
    "updatedAt": "2026-04-23T11:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | UNIT_NOT_FOUND | Đơn vị không tồn tại |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `product_units`
- **Service method**: `ProductsService.updateUnit(id, dto)`
