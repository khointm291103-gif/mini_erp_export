# GET /api/v1/products

## Mô tả
Lấy danh sách sản phẩm có phân trang, tìm kiếm full-text và lọc nhiều chiều.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `page` | integer | 1 | Trang hiện tại |
| `limit` | integer | 20 | Số bản ghi/trang, max 100 |
| `search` | string | — | Tìm theo `productCode`, `name`, `nameEn`, `hsCode`, `tags` |
| `categoryId` | UUID | — | Lọc theo danh mục (bao gồm sản phẩm trong danh mục con) |
| `status` | enum | — | `ACTIVE` \| `INACTIVE` \| `DISCONTINUED` |
| `defaultVendorId` | UUID | — | Lọc theo nhà cung cấp mặc định |
| `hasHsCode` | boolean | — | `true` = chỉ lấy SP có HS Code; `false` = chỉ lấy SP chưa có |
| `sortBy` | string | `createdAt` | `name` \| `productCode` \| `createdAt` \| `defaultPurchasePriceVnd` |
| `order` | string | `DESC` | `ASC` \| `DESC` |

---

## Business Rules

1. Chỉ trả về sản phẩm chưa bị soft-delete (`deletedAt IS NULL`).
2. `search` dùng `ILIKE '%keyword%'` trên `name`, `nameEn`, `productCode`, `hsCode`, và `tags::text`.
3. Khi lọc theo `categoryId`, bao gồm cả sản phẩm trong danh mục con của danh mục đó (2 cấp).
4. Response trả về thông tin cơ bản — không trả market prices hay vendor prices (xem API detail).

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-product-...",
      "productCode": "PRD-0042",
      "name": "Tôm thẻ chân trắng đông lạnh HOSO",
      "nameEn": "Frozen Vannamei Shrimp HOSO",
      "category": { "id": "uuid-...", "name": "Thủy sản đông lạnh" },
      "baseUnit": { "code": "KG", "name": "Kilogram" },
      "hsCode": "030617",
      "netWeight": 1.0,
      "grossWeight": 1.05,
      "defaultPurchasePriceVnd": 85000,
      "defaultCurrency": "USD",
      "defaultSalePrice": 4.5,
      "status": "ACTIVE",
      "defaultVendor": { "id": "uuid-...", "vendorCode": "VND-0001", "name": "Công ty TNHH Thủy Sản Miền Nam" }
    }
  ],
  "meta": {
    "total": 87,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | VALIDATION_ERROR | `page`, `limit` sai định dạng |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table chính**: `products`
- **JOIN**: `product_categories`, `product_units`, `vendors`
- **Service method**: `ProductsService.findAll(query)`
