# GET /api/v1/vendors/:id/price-history

## Mô tả
Lấy danh sách lịch sử giá mua của nhà cung cấp, có thể lọc theo sản phẩm hoặc chỉ xem giá đang hiệu lực.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `productId` | UUID | — | Lọc theo sản phẩm cụ thể |
| `active` | boolean | — | `true` = chỉ bản ghi còn hiệu lực (`effectiveTo IS NULL` hoặc `effectiveTo >= today`) |
| `page` | integer | 1 | Trang hiện tại |
| `limit` | integer | 20 | Số bản ghi/trang, max 100 |
| `sortBy` | string | `effectiveFrom` | `effectiveFrom` \| `createdAt` \| `purchasePriceVnd` |
| `order` | string | `DESC` | `ASC` \| `DESC` |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Khi `active=true`: `WHERE (effective_to IS NULL OR effective_to >= CURRENT_DATE)`.
3. Kết quả bao gồm thông tin cơ bản của sản phẩm (`productCode`, `productName`) từ JOIN với bảng `products`.
4. Sản phẩm đã bị soft-delete vẫn hiện trong lịch sử (để audit), nhưng đánh dấu `productDeleted: true`.

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-history-...",
      "product": {
        "id": "uuid-product-...",
        "productCode": "PRD-0042",
        "name": "Tôm thẻ chân trắng đông lạnh",
        "deleted": false
      },
      "purchasePriceVnd": 85000,
      "minOrderQty": 100,
      "leadTimeDays": 7,
      "effectiveFrom": "2026-04-01",
      "effectiveTo": null,
      "notes": "Giá đã thương lượng Q2/2026",
      "createdAt": "2026-04-23T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 400 | INVALID_UUID | `productId` không phải UUID hợp lệ |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table chính**: `vendor_price_histories`
- **JOIN**: `products` (lấy productCode, name)
- **Service method**: `VendorsService.getPriceHistory(vendorId, query)`
