# GET /api/v1/products/categories

## Mô tả
Lấy danh sách tất cả danh mục sản phẩm theo cấu trúc cây (nested tree). Danh mục cha chứa mảng danh mục con.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `flat` | boolean | false | `true` = trả về danh sách phẳng thay vì cây |
| `activeOnly` | boolean | true | Chỉ lấy danh mục đang active |
| `withProductCount` | boolean | false | Đính kèm số lượng sản phẩm trong mỗi danh mục |

---

## Business Rules

1. Mặc định trả về cấu trúc cây: mỗi category cha có `children: []` chứa các category con.
2. Nếu `flat=true`, trả về mảng phẳng với field `parentId` để client tự dựng cây.
3. Nếu `withProductCount=true`, đính kèm `productCount` = số sản phẩm `ACTIVE` trong danh mục đó (không tính con).
4. Sắp xếp theo `sortOrder ASC`, sau đó `name ASC`.

---

## Response (200 OK) — Dạng cây

```json
{
  "data": [
    {
      "id": "uuid-cat-thuy-san",
      "code": "CAT-001",
      "name": "Thủy sản",
      "nameEn": "Seafood",
      "sortOrder": 1,
      "isActive": true,
      "productCount": 0,
      "children": [
        {
          "id": "uuid-cat-dong-lanh",
          "code": "CAT-012",
          "name": "Thủy sản đông lạnh",
          "nameEn": "Frozen Seafood",
          "sortOrder": 1,
          "isActive": true,
          "productCount": 24,
          "children": []
        }
      ]
    }
  ]
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `product_categories`
- **JOIN**: `products` (count, nếu withProductCount=true)
- **Service method**: `ProductsService.getCategories(query)`
