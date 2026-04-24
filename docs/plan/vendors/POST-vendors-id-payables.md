# POST /api/v1/vendors/:id/payables

## Mô tả
Tạo một khoản công nợ phải trả (Accounts Payable) thủ công cho nhà cung cấp. Dùng cho các khoản thanh toán không đến từ PO (phí dịch vụ, hoa hồng, điều chỉnh...).

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `accountant`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `referenceType` | enum | ✅ | `PO` \| `MANUAL` |
| `referenceNumber` | string | ✅ | Số PO hoặc mã tham chiếu thủ công |
| `description` | string | ✅ | Mô tả khoản phải trả, max 500 ký tự |
| `amountVnd` | number | ✅ | Tổng tiền phải trả VND, > 0 |
| `dueDate` | string (ISO date) | ✅ | Ngày đến hạn thanh toán |
| `invoiceNumber` | string | ❌ | Số hóa đơn GTGT từ NCC |
| `invoiceDate` | string (ISO date) | ❌ | Ngày hóa đơn |
| `notes` | string | ❌ | Ghi chú nội bộ |

**Ví dụ:**
```json
{
  "referenceType": "MANUAL",
  "referenceNumber": "MANUAL-2026-042",
  "description": "Phí vận chuyển nội địa tháng 4/2026",
  "amountVnd": 15000000,
  "dueDate": "2026-05-15",
  "invoiceNumber": "0001234",
  "invoiceDate": "2026-04-20"
}
```

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. `amountVnd` phải > 0.
3. `paidAmountVnd` mặc định = 0 khi tạo.
4. `remainingAmountVnd` = `amountVnd - paidAmountVnd` = `amountVnd` khi tạo.
5. `status` mặc định = `PENDING` khi tạo.
6. Nếu `dueDate` < ngày hiện tại khi tạo — vẫn cho phép tạo nhưng `status = OVERDUE` thay vì `PENDING`.
7. `invoiceDate` nếu có phải <= `dueDate`.

---

## Response (201 Created)

```json
{
  "data": {
    "id": "uuid-payable-...",
    "vendorId": "uuid-vendor-...",
    "referenceType": "MANUAL",
    "referenceNumber": "MANUAL-2026-042",
    "description": "Phí vận chuyển nội địa tháng 4/2026",
    "amountVnd": 15000000,
    "paidAmountVnd": 0,
    "remainingAmountVnd": 15000000,
    "dueDate": "2026-05-15",
    "status": "PENDING",
    "invoiceNumber": "0001234",
    "invoiceDate": "2026-04-20",
    "notes": null,
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 400 | INVALID_AMOUNT | `amountVnd` <= 0 |
| 400 | INVALID_DATE | `invoiceDate` sau `dueDate` |
| 400 | VALIDATION_ERROR | Thiếu field bắt buộc hoặc sai định dạng |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Role không được phép |

---

## Entity liên quan

- **Table**: `vendor_payables`
- **Service method**: `VendorsService.createPayable(vendorId, dto, currentUser)`
