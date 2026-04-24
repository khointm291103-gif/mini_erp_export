# DELETE /api/v1/products/:id

## Mô tả
Soft-delete sản phẩm (`deletedAt = NOW()`). Không xóa vật lý. Dữ liệu lịch sử giao dịch vẫn được giữ nguyên.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc đã bị soft-delete.
2. **Không cho phép xóa** nếu sản phẩm có tồn kho > 0 — trả 409.
3. **Không cho phép xóa** nếu sản phẩm đang nằm trong các đơn hàng mở (SO/PO chưa hoàn thành) — trả 409 (kiểm tra khi các module đó được implement, hiện tại bỏ qua).
4. Không hard-delete.
5. Sau khi xóa, `status` tự động chuyển thành `DISCONTINUED`.

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Sản phẩm PRD-0042 đã được xóa.",
    "deletedAt": "2026-04-23T12:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 409 | PRODUCT_HAS_INVENTORY | Sản phẩm còn tồn kho > 0 |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `products`
- **Service method**: `ProductsService.softDelete(id)`
