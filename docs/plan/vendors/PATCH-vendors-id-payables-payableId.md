# PATCH /api/v1/vendors/:id/payables/:payableId

## Mô tả
Ghi nhận thanh toán (một phần hoặc toàn bộ) cho một khoản công nợ phải trả. Tự động cập nhật `paidAmountVnd`, `remainingAmountVnd` và `status`.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `accountant`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |
| `payableId` | UUID | ID khoản phải trả |

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `paidAmountVnd` | number | ✅ | Số tiền thanh toán lần này, > 0 |
| `notes` | string | ❌ | Ghi chú thanh toán (số chứng từ, ngân hàng...) |

**Ví dụ — thanh toán một phần:**
```json
{
  "paidAmountVnd": 7000000,
  "notes": "Chuyển khoản VCB ngày 23/04, ref: TT2026042301"
}
```

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại, hoặc `payableId` không tồn tại/không thuộc vendor.
2. Trả 400 nếu payable đã có `status = PAID` (đã thanh toán đủ).
3. `paidAmountVnd` (lần này) phải > 0.
4. `paidAmountVnd` (lần này) không được vượt quá `remainingAmountVnd` hiện tại — trả 400 nếu vượt.
5. Sau khi cập nhật:
   - `paidAmountVnd` (tổng) += `paidAmountVnd` (lần này)
   - `remainingAmountVnd` = `amountVnd - paidAmountVnd` (tổng mới)
   - Nếu `remainingAmountVnd = 0` → `status = PAID`, set `paidAt = NOW()`, `paidBy = currentUser.id`
   - Nếu `remainingAmountVnd > 0` → `status = PARTIAL`

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-payable-...",
    "amountVnd": 15000000,
    "paidAmountVnd": 7000000,
    "remainingAmountVnd": 8000000,
    "status": "PARTIAL",
    "paidAt": null,
    "updatedAt": "2026-04-23T14:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại |
| 404 | PAYABLE_NOT_FOUND | payableId không tồn tại hoặc không thuộc vendor |
| 400 | PAYABLE_ALREADY_PAID | Payable đã thanh toán đủ |
| 400 | OVERPAYMENT | Số tiền thanh toán > số tiền còn lại |
| 400 | INVALID_AMOUNT | `paidAmountVnd` <= 0 |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin/accountant được thanh toán |

---

## Entity liên quan

- **Table**: `vendor_payables`
- **Service method**: `VendorsService.recordPayment(vendorId, payableId, dto, currentUser)`
