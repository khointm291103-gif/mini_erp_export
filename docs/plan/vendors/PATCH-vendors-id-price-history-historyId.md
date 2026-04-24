# PATCH /api/v1/vendors/:id/price-history/:historyId

## Mô tả
Đóng hoặc cập nhật một bản ghi giá. Dùng phổ biến nhất để set `effectiveTo` khi giá cũ không còn hiệu lực. Cũng có thể sửa `notes`, `minOrderQty`, `leadTimeDays`.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |
| `historyId` | UUID | ID bản ghi lịch sử giá |

### Body (JSON) — tất cả optional

| Field | Type | Mô tả |
|---|---|---|
| `effectiveTo` | string (ISO date) | Ngày đóng bản ghi giá. Dùng ngày hôm nay để đóng ngay. |
| `minOrderQty` | number | Cập nhật MOQ |
| `leadTimeDays` | integer | Cập nhật thời gian giao hàng |
| `notes` | string | Cập nhật ghi chú |

**Ví dụ — đóng bản ghi giá cũ:**
```json
{
  "effectiveTo": "2026-04-30"
}
```

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc historyId không thuộc vendor.
2. Không cho phép thay đổi `productId`, `purchasePriceVnd`, `effectiveFrom` — đây là immutable fields (phải tạo bản ghi mới nếu giá thay đổi).
3. Nếu `effectiveTo` được set, phải >= `effectiveFrom` của bản ghi.
4. Nếu bản ghi đã có `effectiveTo` (đã đóng), vẫn có thể sửa `effectiveTo` sang ngày khác (điều chỉnh lịch sử).

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-history-...",
    "purchasePriceVnd": 85000,
    "effectiveFrom": "2026-04-01",
    "effectiveTo": "2026-04-30",
    "notes": "Đóng giá Q2/2026 — áp giá mới từ 01/05"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại |
| 404 | PRICE_HISTORY_NOT_FOUND | historyId không tồn tại hoặc không thuộc vendor |
| 400 | INVALID_DATE | `effectiveTo` trước `effectiveFrom` |
| 400 | IMMUTABLE_FIELD | Cố thay đổi `purchasePriceVnd` hoặc `productId` |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `vendor_price_histories`
- **Service method**: `VendorsService.updatePriceHistory(vendorId, historyId, dto)`
