# DELETE /api/v1/products/units/:id

## Mô tả
Vô hiệu hóa một đơn vị tính (`isActive = false`). Không cho phép nếu đơn vị đang được dùng làm `baseUnit` của sản phẩm active.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID đơn vị tính |

---

## Business Rules

1. Trả 404 nếu đơn vị không tồn tại.
2. **Không cho phép** vô hiệu hóa nếu đơn vị đang là `baseUnitId` của bất kỳ sản phẩm `ACTIVE` nào — trả 409.
3. Set `isActive = false` thay vì hard-delete.

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Đơn vị tính CTN đã được vô hiệu hóa."
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | UNIT_NOT_FOUND | Đơn vị không tồn tại |
| 409 | UNIT_IN_USE | Đang được dùng bởi sản phẩm active |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `product_units`
- **Check**: `products.base_unit_id`
- **Service method**: `ProductsService.deactivateUnit(id)`
