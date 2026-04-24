# PATCH /api/v1/products/:id/status

## Mô tả
Thay đổi trạng thái của sản phẩm: `ACTIVE`, `INACTIVE`, hoặc `DISCONTINUED`.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `status` | enum | ✅ | `ACTIVE` \| `INACTIVE` \| `DISCONTINUED` |
| `reason` | string | ❌ | Lý do thay đổi (bắt buộc khi DISCONTINUED) |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc đã soft-delete.
2. Idempotent — không báo lỗi nếu status mới = status cũ.
3. Khi chuyển sang `DISCONTINUED`: `reason` bắt buộc.
4. Sản phẩm `DISCONTINUED` vẫn còn trong hệ thống — chỉ không thể tạo đơn hàng mới với sản phẩm này (business rule ở module Sales/Purchasing).

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-product-...",
    "productCode": "PRD-0042",
    "status": "DISCONTINUED",
    "updatedAt": "2026-04-23T12:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 400 | REASON_REQUIRED | DISCONTINUED nhưng thiếu reason |
| 400 | INVALID_STATUS | Status không hợp lệ |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `products`
- **Service method**: `ProductsService.changeStatus(id, dto)`
