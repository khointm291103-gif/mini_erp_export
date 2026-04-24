# GET /api/v1/products/categories/:id

## Mô tả
Lấy chi tiết một danh mục sản phẩm, bao gồm danh mục con và số lượng sản phẩm.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID danh mục |

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-cat-thuy-san",
    "code": "CAT-001",
    "name": "Thủy sản",
    "nameEn": "Seafood",
    "parent": null,
    "description": "Các sản phẩm thủy hải sản",
    "sortOrder": 1,
    "isActive": true,
    "productCount": 0,
    "children": [
      {
        "id": "uuid-cat-dong-lanh",
        "code": "CAT-012",
        "name": "Thủy sản đông lạnh",
        "productCount": 24,
        "isActive": true
      }
    ],
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-15T08:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | CATEGORY_NOT_FOUND | Danh mục không tồn tại |
| 400 | INVALID_UUID | `:id` không phải UUID |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `product_categories`
- **Service method**: `ProductsService.getCategoryById(id)`
