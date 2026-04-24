# POST /api/v1/vendors

## Mô tả
Tạo mới một nhà cung cấp trong nước. Sau khi tạo, hệ thống tự sinh `vendorCode` theo định dạng `VND-XXXX`.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Tên nhà cung cấp, max 200 ký tự |
| `taxCode` | string | ❌ | Mã số thuế (MST), unique, max 20 ký tự |
| `address` | string | ❌ | Địa chỉ đầy đủ |
| `city` | string | ❌ | Tỉnh/Thành phố, max 100 ký tự |
| `contactName` | string | ❌ | Tên người liên hệ, max 150 ký tự |
| `contactPhone` | string | ❌ | Số điện thoại liên hệ, max 30 ký tự |
| `contactEmail` | string | ❌ | Email liên hệ, phải đúng định dạng email |
| `industry` | string | ❌ | Ngành hàng (vd: Nông sản, Thủy sản, Dệt may), max 100 ký tự |
| `paymentTerms` | enum | ✅ | `IMMEDIATE` \| `NET_30` \| `NET_60` \| `NET_90` \| `CUSTOM` |
| `paymentDueDays` | integer | ❌ | Số ngày nợ khi paymentTerms = CUSTOM (0–365), default 0 |
| `bankName` | string | ❌ | Tên ngân hàng |
| `bankAccountNumber` | string | ❌ | Số tài khoản ngân hàng |
| `bankBranch` | string | ❌ | Chi nhánh ngân hàng |
| `notes` | string | ❌ | Ghi chú nội bộ |

**Ví dụ request:**
```json
{
  "name": "Công ty TNHH Thủy Sản Miền Nam",
  "taxCode": "0312345678",
  "address": "123 Nguyễn Văn Cừ, Q.5",
  "city": "TP. Hồ Chí Minh",
  "contactName": "Nguyễn Văn A",
  "contactPhone": "0901234567",
  "contactEmail": "contact@thuysanmienmam.vn",
  "industry": "Thủy sản",
  "paymentTerms": "NET_30",
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "bankBranch": "CN TP.HCM"
}
```

---

## Business Rules

1. `taxCode` phải unique trong hệ thống nếu được cung cấp — trả 409 nếu đã tồn tại.
2. `vendorCode` được tự sinh theo format `VND-` + 4 chữ số tăng dần (VND-0001, VND-0002...). Logic: lấy max vendorCode hiện tại, tăng lên 1.
3. Khi `paymentTerms` = `IMMEDIATE`, tự động set `paymentDueDays = 0`.
4. Khi `paymentTerms` = `NET_30`, tự động set `paymentDueDays = 30` (tương tự NET_60 = 60, NET_90 = 90).
5. Khi `paymentTerms` = `CUSTOM`, `paymentDueDays` bắt buộc phải được cung cấp.
6. `status` mặc định là `ACTIVE` khi tạo mới.
7. `deletedAt` mặc định `null` (chưa bị xóa).

---

## Response (201 Created)

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
    "createdAt": "2026-04-23T10:00:00.000Z",
    "updatedAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | VALIDATION_ERROR | Thiếu `name`, sai định dạng email, `paymentDueDays` ngoài 0–365 |
| 400 | MISSING_PAYMENT_DUE_DAYS | `paymentTerms = CUSTOM` nhưng không có `paymentDueDays` |
| 409 | VENDOR_TAX_CODE_EXISTS | `taxCode` đã tồn tại trong hệ thống |
| 401 | UNAUTHORIZED | Không có hoặc JWT hết hạn |
| 403 | FORBIDDEN | Role không được phép |

---

## Entity liên quan

- **Table**: `vendors`
- **Module**: `VendorsModule`
- **Service method**: `VendorsService.create(dto, currentUser)`

---

## Ghi chú implementation

- Dùng `@nestjs/class-validator` với `@IsEnum`, `@IsEmail`, `@IsOptional`, `@MaxLength` trên DTO.
- Auto-generate `vendorCode`: query `SELECT MAX(vendor_code) FROM vendors` rồi parse số, tăng 1, format với `padStart(4, '0')`.
- Wrap trong transaction nếu cần đảm bảo vendorCode unique khi concurrent.
