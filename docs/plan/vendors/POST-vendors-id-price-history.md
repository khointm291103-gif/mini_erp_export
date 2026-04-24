# POST /api/v1/vendors/:id/price-history

## Mô tả
Thêm một bản ghi giá mua mới cho một sản phẩm cụ thể từ nhà cung cấp này. Dùng để theo dõi lịch sử giá mua theo thời gian — mỗi lần thương lượng giá mới là một bản ghi riêng.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `productId` | UUID | ✅ | ID sản phẩm |
| `purchasePriceVnd` | number | ✅ | Giá mua VND, > 0 |
| `minOrderQty` | number | ❌ | Số lượng đặt tối thiểu (MOQ) |
| `leadTimeDays` | integer | ❌ | Số ngày giao hàng, min 0 |
| `effectiveFrom` | string (ISO date) | ✅ | Ngày áp dụng giá (YYYY-MM-DD) |
| `effectiveTo` | string (ISO date) | ❌ | Ngày hết hiệu lực (null = đang hiệu lực) |
| `notes` | string | ❌ | Ghi chú, max 500 ký tự |

**Ví dụ:**
```json
{
  "productId": "uuid-product-...",
  "purchasePriceVnd": 85000,
  "minOrderQty": 100,
  "leadTimeDays": 7,
  "effectiveFrom": "2026-04-01",
  "notes": "Giá đã thương lượng Q2/2026"
}
```

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Trả 404 nếu `productId` không tồn tại hoặc đã soft-delete.
3. `purchasePriceVnd` phải > 0.
4. `effectiveFrom` phải là ngày hợp lệ, không cần phải >= hôm nay (cho phép nhập giá lịch sử).
5. Nếu `effectiveTo` được cung cấp, phải sau `effectiveFrom`.
6. Khi thêm bản ghi giá mới với `effectiveFrom` mới, hệ thống **không tự động** đóng bản ghi giá cũ — người dùng phải tự đóng qua API `PATCH /price-history/:historyId`.
7. `createdBy` lấy từ JWT của user đang đăng nhập.

---

## Response (201 Created)

```json
{
  "data": {
    "id": "uuid-history-...",
    "vendorId": "uuid-vendor-...",
    "productId": "uuid-product-...",
    "productCode": "PRD-0042",
    "productName": "Tôm thẻ chân trắng đông lạnh",
    "purchasePriceVnd": 85000,
    "minOrderQty": 100,
    "leadTimeDays": 7,
    "effectiveFrom": "2026-04-01",
    "effectiveTo": null,
    "notes": "Giá đã thương lượng Q2/2026",
    "createdBy": "uuid-user-...",
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 404 | PRODUCT_NOT_FOUND | Product không tồn tại hoặc đã xóa |
| 400 | INVALID_PRICE | `purchasePriceVnd` <= 0 |
| 400 | INVALID_DATE_RANGE | `effectiveTo` trước `effectiveFrom` |
| 400 | VALIDATION_ERROR | Sai định dạng field |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Role không được phép |

---

## Entity liên quan

- **Table**: `vendor_price_histories`
- **Service method**: `VendorsService.addPriceHistory(vendorId, dto, currentUser)`
