# PATCH /api/v1/vendors/:id

## Mô tả
Cập nhật thông tin nhà cung cấp. Chỉ cập nhật các field được gửi lên (partial update).

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID của nhà cung cấp |

### Body (JSON) — tất cả fields đều optional

| Field | Type | Mô tả |
|---|---|---|
| `name` | string | Tên nhà cung cấp, max 200 ký tự |
| `taxCode` | string | Mã số thuế, unique, max 20 ký tự |
| `address` | string | Địa chỉ |
| `city` | string | Tỉnh/Thành phố |
| `contactName` | string | Tên người liên hệ |
| `contactPhone` | string | Số điện thoại |
| `contactEmail` | string | Email hợp lệ |
| `industry` | string | Ngành hàng |
| `paymentTerms` | enum | `IMMEDIATE` \| `NET_30` \| `NET_60` \| `NET_90` \| `CUSTOM` |
| `paymentDueDays` | integer | 0–365, bắt buộc khi paymentTerms = CUSTOM |
| `bankName` | string | Tên ngân hàng |
| `bankAccountNumber` | string | Số tài khoản |
| `bankBranch` | string | Chi nhánh |
| `notes` | string | Ghi chú nội bộ |

**Ví dụ request:**
```json
{
  "contactPhone": "0909999999",
  "paymentTerms": "NET_60"
}
```

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Nếu `taxCode` được cập nhật, kiểm tra unique (loại trừ vendor hiện tại) — trả 409 nếu trùng.
3. Không được thay đổi `vendorCode` — field này bị ignore nếu có trong body.
4. Nếu `paymentTerms` = CUSTOM và không có `paymentDueDays` trong body (và chưa có sẵn), trả 400.
5. `updatedAt` tự động cập nhật.
6. Không thay đổi `status` qua API này — dùng `PATCH /vendors/:id/status`.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-...",
    "vendorCode": "VND-0001",
    "name": "Công ty TNHH Thủy Sản Miền Nam",
    "contactPhone": "0909999999",
    "paymentTerms": "NET_60",
    "paymentDueDays": 60,
    "updatedAt": "2026-04-23T11:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 409 | VENDOR_TAX_CODE_EXISTS | `taxCode` trùng với vendor khác |
| 400 | VALIDATION_ERROR | Sai định dạng field |
| 400 | MISSING_PAYMENT_DUE_DAYS | CUSTOM terms nhưng thiếu paymentDueDays |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Role không được phép |

---

## Entity liên quan

- **Table**: `vendors`
- **Service method**: `VendorsService.update(id, dto, currentUser)`
