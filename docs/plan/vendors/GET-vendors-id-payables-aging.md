# GET /api/v1/vendors/:id/payables/aging

## Mô tả
Báo cáo AP Aging cho một nhà cung cấp — phân loại công nợ theo dải số ngày quá hạn. Dùng cho dashboard kế toán và báo cáo thanh toán.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `accountant`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `asOfDate` | string (ISO date) | Hôm nay | Tính aging tính đến ngày này |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Chỉ tính các payables có `status IN ('PENDING', 'PARTIAL', 'OVERDUE')` — bỏ qua PAID.
3. Aging buckets tính theo `asOfDate - dueDate` (số ngày quá hạn):
   - **Current**: chưa đến hạn (dueDate >= asOfDate)
   - **1–30 ngày**: quá hạn 1–30 ngày
   - **31–60 ngày**: quá hạn 31–60 ngày
   - **61–90 ngày**: quá hạn 61–90 ngày
   - **> 90 ngày**: quá hạn > 90 ngày
4. Số tiền dùng là `remainingAmountVnd` (chưa thanh toán), không phải `amountVnd`.

---

## Response (200 OK)

```json
{
  "data": {
    "vendorId": "uuid-vendor-...",
    "vendorCode": "VND-0001",
    "name": "Công ty TNHH Thủy Sản Miền Nam",
    "asOfDate": "2026-04-23",
    "aging": {
      "current": {
        "count": 1,
        "totalRemainingVnd": 15000000
      },
      "1_30": {
        "count": 0,
        "totalRemainingVnd": 0
      },
      "31_60": {
        "count": 1,
        "totalRemainingVnd": 8000000
      },
      "61_90": {
        "count": 0,
        "totalRemainingVnd": 0
      },
      "over_90": {
        "count": 0,
        "totalRemainingVnd": 0
      }
    },
    "totalRemainingVnd": 23000000,
    "totalCount": 2
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 400 | INVALID_DATE | `asOfDate` sai định dạng |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `vendor_payables`
- **Service method**: `VendorsService.getPayablesAging(vendorId, asOfDate)`

---

## Ghi chú implementation

```sql
SELECT
  CASE
    WHEN due_date >= $asOfDate THEN 'current'
    WHEN $asOfDate - due_date BETWEEN 1 AND 30 THEN '1_30'
    WHEN $asOfDate - due_date BETWEEN 31 AND 60 THEN '31_60'
    WHEN $asOfDate - due_date BETWEEN 61 AND 90 THEN '61_90'
    ELSE 'over_90'
  END as bucket,
  COUNT(*) as count,
  SUM(remaining_amount_vnd) as total
FROM vendor_payables
WHERE vendor_id = $vendorId AND status IN ('PENDING','PARTIAL','OVERDUE')
GROUP BY bucket
```
