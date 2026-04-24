# GET /api/v1/vendors/compare-prices

## Mô tả
So sánh giá mua hiện tại của một sản phẩm từ tất cả các nhà cung cấp đang cung cấp sản phẩm đó. Dùng để hỗ trợ quyết định chọn nhà cung cấp khi lập PO.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Query Params

| Param | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `productId` | UUID | ✅ | ID sản phẩm cần so sánh giá |
| `asOfDate` | string (ISO date) | ❌ | Tính giá tại ngày này (mặc định: hôm nay) |

**Ví dụ:**
```
GET /api/v1/vendors/compare-prices?productId=uuid-product-...
```

---

## Business Rules

1. Trả 404 nếu `productId` không tồn tại hoặc đã soft-delete.
2. Lấy tất cả bản ghi `vendor_price_histories` có:
   - `product_id = productId`
   - `effective_from <= asOfDate`
   - `effective_to IS NULL OR effective_to >= asOfDate`
   - Vendor chưa bị soft-delete
   - Vendor status = `ACTIVE`
3. Nếu không có vendor nào cung cấp sản phẩm này → trả `data: []` (không phải 404).
4. Sắp xếp mặc định: `purchasePriceVnd ASC` (giá thấp nhất trước).
5. Đánh dấu vendor có giá thấp nhất bằng `isCheapest: true`.
6. Đánh dấu vendor là `defaultVendor: true` nếu là `defaultVendorId` của sản phẩm.

---

## Response (200 OK)

```json
{
  "data": {
    "product": {
      "id": "uuid-product-...",
      "productCode": "PRD-0042",
      "name": "Tôm thẻ chân trắng đông lạnh",
      "baseUnit": "KG"
    },
    "asOfDate": "2026-04-23",
    "vendors": [
      {
        "vendor": {
          "id": "uuid-vendor-1",
          "vendorCode": "VND-0001",
          "name": "Công ty TNHH Thủy Sản Miền Nam",
          "overallScore": 4.33
        },
        "priceHistoryId": "uuid-history-...",
        "purchasePriceVnd": 82000,
        "minOrderQty": 100,
        "leadTimeDays": 5,
        "effectiveFrom": "2026-04-01",
        "isCheapest": true,
        "isDefaultVendor": true
      },
      {
        "vendor": {
          "id": "uuid-vendor-2",
          "vendorCode": "VND-0005",
          "name": "HTX Thủy Sản Cà Mau",
          "overallScore": 3.83
        },
        "priceHistoryId": "uuid-history-2",
        "purchasePriceVnd": 87000,
        "minOrderQty": 500,
        "leadTimeDays": 10,
        "effectiveFrom": "2026-03-15",
        "isCheapest": false,
        "isDefaultVendor": false
      }
    ]
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | MISSING_PRODUCT_ID | `productId` không được cung cấp |
| 404 | PRODUCT_NOT_FOUND | `productId` không tồn tại hoặc đã xóa |
| 400 | INVALID_UUID | `productId` không phải UUID hợp lệ |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table chính**: `vendor_price_histories`
- **JOIN**: `vendors` (tên, rating), `products` (thông tin sản phẩm)
- **Service method**: `VendorsService.comparePrices(productId, asOfDate)`
