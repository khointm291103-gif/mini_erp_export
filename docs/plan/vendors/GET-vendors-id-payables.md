# GET /api/v1/vendors/:id/payables

## Mô tả
Lấy danh sách công nợ phải trả (AP) của một nhà cung cấp, có lọc theo trạng thái và ngày đến hạn.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `accountant`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `status` | enum | — | `PENDING` \| `PARTIAL` \| `PAID` \| `OVERDUE` |
| `dueBefore` | string (ISO date) | — | Lọc các khoản đến hạn trước ngày này |
| `dueAfter` | string (ISO date) | — | Lọc các khoản đến hạn sau ngày này |
| `page` | integer | 1 | |
| `limit` | integer | 20 | Max 100 |
| `sortBy` | string | `dueDate` | `dueDate` \| `amountVnd` \| `createdAt` |
| `order` | string | `ASC` | `ASC` \| `DESC` |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Trước khi query, cập nhật status các payables `PENDING` hoặc `PARTIAL` có `dueDate < TODAY` thành `OVERDUE` (cập nhật lazy khi query, không cần cron job).
3. Response bao gồm `totalSummary` tổng hợp ở cuối.

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-payable-...",
      "referenceType": "MANUAL",
      "referenceNumber": "MANUAL-2026-042",
      "description": "Phí vận chuyển nội địa tháng 4/2026",
      "amountVnd": 15000000,
      "paidAmountVnd": 0,
      "remainingAmountVnd": 15000000,
      "dueDate": "2026-05-15",
      "status": "PENDING",
      "invoiceNumber": "0001234",
      "createdAt": "2026-04-23T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "summary": {
    "totalAmountVnd": 45000000,
    "totalPaidVnd": 10000000,
    "totalRemainingVnd": 35000000,
    "countByStatus": {
      "PENDING": 2,
      "PARTIAL": 1,
      "PAID": 0,
      "OVERDUE": 0
    }
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 400 | INVALID_DATE | `dueBefore`/`dueAfter` sai định dạng |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `vendor_payables`
- **Service method**: `VendorsService.getPayables(vendorId, query)`
