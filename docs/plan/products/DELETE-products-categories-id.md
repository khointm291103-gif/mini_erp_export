# DELETE /api/v1/products/categories/:id

## Mô tả
Xóa mềm một danh mục sản phẩm bằng cách set `isActive = false`. Không hard-delete. Chỉ cho phép nếu danh mục không còn sản phẩm active và không còn danh mục con active.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID danh mục cần xóa |

---

## Business Rules

1. Trả 404 nếu danh mục không tồn tại.
2. **Không cho phép xóa** nếu còn sản phẩm `ACTIVE` trong danh mục — trả 409 kèm số lượng sản phẩm.
3. **Không cho phép xóa** nếu còn danh mục con `isActive = true` — trả 409 kèm danh sách con.
4. Không hard-delete — set `isActive = false` (product_categories không có deletedAt, dùng isActive).

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Danh mục CAT-012 đã được vô hiệu hóa."
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | CATEGORY_NOT_FOUND | Danh mục không tồn tại |
| 409 | CATEGORY_HAS_ACTIVE_PRODUCTS | Còn `activeProductCount` sản phẩm đang active |
| 409 | CATEGORY_HAS_ACTIVE_CHILDREN | Còn danh mục con đang active |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `product_categories`
- **Check**: `products` (count ACTIVE), `product_categories` (children)
- **Service method**: `ProductsService.deleteCategory(id)`
