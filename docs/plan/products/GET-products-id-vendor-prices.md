# GET /api/v1/products/:id/vendor-prices

## Mô tả
Lấy danh sách tất cả nhà cung cấp đang cung cấp sản phẩm này kèm giá mua hiện tại. Tương đương với `GET /vendors/compare-prices?productId=X` nhưng từ góc độ sản phẩm.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`, `accountant`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `activeOnly` | boolean | true | Chỉ lấy nhà cung cấp `ACTIVE` và có giá đang hiệu lực |
| `asOfDate` | string (ISO date) | Hôm nay | Lấy giá tại ngày này |
| `sortBy` | string | `purchasePriceVnd` | `purchasePriceVnd` \| `vendorName` \| `leadTimeDays` |
| `order` | string | `ASC` | `ASC` \| `DESC` |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc đã soft-delete.
2. Giá hiệu lực: `effectiveFrom <= asOfDate AND (effectiveTo IS NULL OR effectiveTo >= asOfDate)`.
3. Nếu cùng một vendor có nhiều bản ghi giá hiệu lực cho sản phẩm này, lấy bản ghi có `effectiveFrom` mới nhất.
4. Đánh dấu `isCheapest: true` cho vendor có `purchasePriceVnd` thấp nhất.
5. Đánh dấu `isDefault: true` cho vendor là `defaultVendorId` của sản phẩm.

---

## Response (200 OK)

```json
{
  "data": {
    "product": {
      "id": "uuid-product-...",
      "productCode": "PRD-0042",
      "name": "Tôm thẻ chân trắng đông lạnh HOSO",
      "baseUnit": "KG"
    },
    "asOfDate": "2026-04-23",
    "vendorPrices": [
      {
        "vendor": {
          "id": "uuid-vendor-1",
          "vendorCode": "VND-0001",
          "name": "Công ty TNHH Thủy Sản Miền Nam",
          "status": "ACTIVE",
          "overallScore": 4.33
        },
        "purchasePriceVnd": 82000,
        "minOrderQty": 100,
        "leadTimeDays": 5,
        "effectiveFrom": "2026-04-01",
        "effectiveTo": null,
        "isCheapest": true,
        "isDefault": true
      },
      {
        "vendor": {
          "id": "uuid-vendor-2",
          "vendorCode": "VND-0005",
          "name": "HTX Thủy Sản Cà Mau",
          "status": "ACTIVE",
          "overallScore": 3.83
        },
        "purchasePriceVnd": 87000,
        "minOrderQty": 500,
        "leadTimeDays": 10,
        "effectiveFrom": "2026-03-15",
        "effectiveTo": null,
        "isCheapest": false,
        "isDefault": false
      }
    ]
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Role không được phép xem giá mua |

---

## Entity liên quan

- **Table chính**: `vendor_price_histories`
- **JOIN**: `vendors` (thông tin nhà cung cấp, overallScore từ vendor_ratings), `products`
- **Service method**: `ProductsService.getVendorPrices(productId, query)`
