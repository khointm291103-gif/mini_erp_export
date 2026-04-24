# GET /api/v1/vendors/payables/due-alerts

## Mô tả
Lấy danh sách tất cả các khoản công nợ phải trả (AP) sắp đến hạn hoặc đã quá hạn, gộp từ tất cả nhà cung cấp. Dùng cho dashboard kế toán và cảnh báo thanh toán.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `accountant`.

---

## Request

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `dueDays` | integer | 7 | Cảnh báo các khoản đến hạn trong `dueDays` ngày tới |
| `includeOverdue` | boolean | true | Có bao gồm các khoản đã quá hạn không |
| `vendorId` | UUID | — | Lọc theo nhà cung cấp cụ thể |
| `page` | integer | 1 | |
| `limit` | integer | 50 | Max 200 |
| `sortBy` | string | `dueDate` | `dueDate` \| `remainingAmountVnd` |
| `order` | string | `ASC` | `ASC` \| `DESC` |

---

## Business Rules

1. `dueDays` = số ngày nhìn về tương lai: lấy các payable có `dueDate <= TODAY + dueDays` VÀ `status IN ('PENDING', 'PARTIAL', 'OVERDUE')`.
2. Nếu `includeOverdue = true` (mặc định), cũng bao gồm các payable có `dueDate < TODAY`.
3. Response nhóm theo `urgency`:
   - `OVERDUE`: dueDate < today
   - `DUE_TODAY`: dueDate = today
   - `DUE_SOON`: dueDate trong 1–7 ngày tới
   - `UPCOMING`: dueDate sau 7 ngày (chỉ hiện khi `dueDays > 7`)

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-payable-...",
      "urgency": "OVERDUE",
      "daysOverdue": 5,
      "vendor": {
        "id": "uuid-vendor-...",
        "vendorCode": "VND-0002",
        "name": "Công ty CP Xuất Nhập Khẩu ABC"
      },
      "referenceNumber": "PO-2026-0031",
      "description": "Thanh toán PO tháng 3",
      "amountVnd": 120000000,
      "remainingAmountVnd": 120000000,
      "dueDate": "2026-04-18",
      "status": "OVERDUE"
    }
  ],
  "meta": {
    "total": 4,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  },
  "summary": {
    "overdueCount": 1,
    "overdueAmountVnd": 120000000,
    "dueTodayCount": 0,
    "dueSoonCount": 3,
    "dueSoonAmountVnd": 45000000
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | INVALID_DUE_DAYS | `dueDays` không phải số nguyên dương, max 90 |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Role không được phép |

---

## Entity liên quan

- **Table**: `vendor_payables`
- **JOIN**: `vendors` (lấy vendorCode, name)
- **Service method**: `VendorsService.getPayableDueAlerts(query)`
