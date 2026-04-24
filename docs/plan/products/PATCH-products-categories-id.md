# PATCH /api/v1/products/categories/:id

## Mô tả
Cập nhật thông tin danh mục sản phẩm. Partial update — chỉ cập nhật các field được gửi lên.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID danh mục cần cập nhật |

### Body (JSON) — tất cả optional

| Field | Type | Mô tả |
|---|---|---|
| `name` | string | Tên danh mục tiếng Việt |
| `nameEn` | string | Tên tiếng Anh |
| `description` | string | Mô tả |
| `sortOrder` | integer | Thứ tự hiển thị |
| `isActive` | boolean | Kích hoạt / vô hiệu hóa danh mục |
| `parentId` | UUID \| null | Thay đổi danh mục cha (null = lên cấp root) |

---

## Business Rules

1. Trả 404 nếu danh mục không tồn tại.
2. Không cho phép thay đổi `code` — field này immutable sau khi tạo.
3. Nếu `parentId` được thay đổi, kiểm tra:
   - `parentId` mới phải tồn tại
   - Không được set `parentId = id` (tự tham chiếu)
   - `parentId` mới không được là danh mục con (chỉ 1 cấp)
4. Khi `isActive = false`: không vô hiệu hóa nếu còn sản phẩm `ACTIVE` trong danh mục — trả 409.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-cat-dong-lanh",
    "code": "CAT-012",
    "name": "Thủy sản đông lạnh",
    "nameEn": "Frozen Seafood",
    "isActive": true,
    "updatedAt": "2026-04-23T11:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | CATEGORY_NOT_FOUND | Danh mục không tồn tại |
| 400 | SELF_REFERENCE | `parentId = id` |
| 400 | NESTING_NOT_ALLOWED | parentId mới đã là danh mục con |
| 404 | PARENT_NOT_FOUND | `parentId` mới không tồn tại |
| 409 | CATEGORY_HAS_ACTIVE_PRODUCTS | Vô hiệu hóa nhưng còn sản phẩm active |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `product_categories`
- **Service method**: `ProductsService.updateCategory(id, dto)`
