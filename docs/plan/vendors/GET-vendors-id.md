# GET /api/v1/vendors/:id

## Mô tả
Lấy thông tin chi tiết của một nhà cung cấp, bao gồm tóm tắt điểm đánh giá gần nhất và tổng công nợ phải trả (AP) hiện tại.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID của nhà cung cấp |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã bị soft-delete (`deletedAt IS NOT NULL`).
2. `latestRating` là bản ghi `vendor_ratings` có `ratingPeriod` lớn nhất (mới nhất).
3. `apSummary.totalPending` = tổng `remainingAmountVnd` của các payables có `status IN ('PENDING', 'PARTIAL')`.
4. `apSummary.overdueCount` = số payables có `status = 'OVERDUE'` hoặc (`status != 'PAID'` AND `dueDate < NOW()`).
5. Không trả về chi tiết từng payable hay price history — chỉ trả summary.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-...",
    "vendorCode": "VND-0001",
    "name": "Công ty TNHH Thủy Sản Miền Nam",
    "taxCode": "0312345678",
    "address": "123 Nguyễn Văn Cừ, Q.5",
    "city": "TP. Hồ Chí Minh",
    "contactName": "Nguyễn Văn A",
    "contactPhone": "0901234567",
    "contactEmail": "contact@thuysanmienmam.vn",
    "industry": "Thủy sản",
    "paymentTerms": "NET_30",
    "paymentDueDays": 30,
    "bankName": "Vietcombank",
    "bankAccountNumber": "1234567890",
    "bankBranch": "CN TP.HCM",
    "status": "ACTIVE",
    "notes": null,
    "latestRating": {
      "ratingPeriod": "2026-03",
      "qualityScore": 4,
      "deliveryScore": 5,
      "priceScore": 4,
      "overallScore": 4.33,
      "onTimeDeliveryRate": 95.5
    },
    "apSummary": {
      "totalPendingVnd": 150000000,
      "overdueCount": 1
    },
    "createdAt": "2026-04-23T10:00:00.000Z",
    "updatedAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 400 | INVALID_UUID | `:id` không phải UUID hợp lệ |
| 401 | UNAUTHORIZED | Không có hoặc JWT hết hạn |

---

## Entity liên quan

- **Table chính**: `vendors`
- **Table phụ**: `vendor_ratings` (lấy bản ghi mới nhất), `vendor_payables` (aggregate)
- **Service method**: `VendorsService.findOne(id)`
