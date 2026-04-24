# POST /api/v1/products/categories

## Mô tả
Tạo danh mục sản phẩm mới. Hỗ trợ cây phân cấp cha-con một cấp (parent-child). Mã danh mục tự sinh nếu không cung cấp.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Tên danh mục tiếng Việt, max 150 ký tự |
| `nameEn` | string | ❌ | Tên tiếng Anh (dùng cho export docs) |
| `code` | string | ❌ | Mã danh mục, auto-gen `CAT-XXX` nếu không cung cấp |
| `parentId` | UUID | ❌ | ID danh mục cha (để tạo danh mục con) |
| `description` | string | ❌ | Mô tả |
| `sortOrder` | integer | ❌ | Thứ tự hiển thị, default 0 |

**Ví dụ:**
```json
{
  "name": "Thủy sản đông lạnh",
  "nameEn": "Frozen Seafood",
  "parentId": "uuid-category-thuy-san",
  "sortOrder": 1
}
```

---

## Business Rules

1. `code` phải unique nếu được cung cấp — trả 409 nếu đã tồn tại.
2. Nếu `code` không cung cấp, tự sinh theo format `CAT-XXX` (3 chữ số).
3. Nếu `parentId` được cung cấp, phải tồn tại và không được là danh mục con (chỉ hỗ trợ 1 cấp cha-con). Trả 400 nếu `parentId` đã có `parentId` của riêng nó.
4. `isActive` mặc định `true`.

---

## Response (201 Created)

```json
{
  "data": {
    "id": "uuid-category-...",
    "code": "CAT-012",
    "name": "Thủy sản đông lạnh",
    "nameEn": "Frozen Seafood",
    "parentId": "uuid-category-thuy-san",
    "description": null,
    "sortOrder": 1,
    "isActive": true,
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 409 | CATEGORY_CODE_EXISTS | `code` đã tồn tại |
| 404 | PARENT_NOT_FOUND | `parentId` không tồn tại |
| 400 | NESTING_NOT_ALLOWED | `parentId` đã là danh mục con (chỉ hỗ trợ 1 cấp) |
| 400 | VALIDATION_ERROR | Thiếu `name` hoặc sai định dạng |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `product_categories`
- **Service method**: `ProductsService.createCategory(dto)`
