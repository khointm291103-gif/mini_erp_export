# GET /api/v1/vendors/:id/price-history/:historyId

## Mô tả
Lấy chi tiết một bản ghi lịch sử giá mua cụ thể.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |
| `historyId` | UUID | ID bản ghi lịch sử giá |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Trả 404 nếu `historyId` không tồn tại hoặc không thuộc vendor này (`vendorId != :id`).

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-history-...",
    "vendor": {
      "id": "uuid-vendor-...",
      "vendorCode": "VND-0001",
      "name": "Công ty TNHH Thủy Sản Miền Nam"
    },
    "product": {
      "id": "uuid-product-...",
      "productCode": "PRD-0042",
      "name": "Tôm thẻ chân trắng đông lạnh",
      "baseUnit": "KG"
    },
    "purchasePriceVnd": 85000,
    "minOrderQty": 100,
    "leadTimeDays": 7,
    "effectiveFrom": "2026-04-01",
    "effectiveTo": null,
    "notes": "Giá đã thương lượng Q2/2026",
    "createdBy": {
      "id": "uuid-user-...",
      "name": "Nguyễn Mua Hàng"
    },
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại |
| 404 | PRICE_HISTORY_NOT_FOUND | historyId không tồn tại hoặc không thuộc vendor |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `vendor_price_histories`
- **JOIN**: `vendors`, `products`, `users` (createdBy)
- **Service method**: `VendorsService.getPriceHistoryById(vendorId, historyId)`
