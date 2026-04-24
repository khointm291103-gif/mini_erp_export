# PATCH /api/v1/vendors/:id/status

## Mô tả
Thay đổi trạng thái hoạt động của nhà cung cấp: `ACTIVE`, `INACTIVE`, hoặc `BLACKLISTED`. Mỗi chuyển trạng thái có quy tắc riêng.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing_manager`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID của nhà cung cấp |

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `status` | enum | ✅ | `ACTIVE` \| `INACTIVE` \| `BLACKLISTED` |
| `reason` | string | ✅ khi BLACKLISTED | Lý do bắt buộc khi chuyển sang BLACKLISTED |

**Ví dụ:**
```json
{
  "status": "BLACKLISTED",
  "reason": "Vi phạm hợp đồng, giao hàng kém chất lượng nhiều lần"
}
```

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Không cần trả lỗi nếu status mới = status hiện tại (idempotent).
3. Khi chuyển sang `BLACKLISTED`: `reason` là bắt buộc — trả 400 nếu thiếu.
4. Vendor `BLACKLISTED` vẫn còn trong hệ thống — không thể tạo PO mới cho vendor này (business rule ở module Purchasing, không phải ở đây).
5. Ghi log vào audit trail (nếu đã có bảng audit_log): ai thay đổi, trạng thái cũ → mới, lý do.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-...",
    "vendorCode": "VND-0001",
    "name": "Công ty TNHH Thủy Sản Miền Nam",
    "status": "BLACKLISTED",
    "updatedAt": "2026-04-23T12:30:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 400 | REASON_REQUIRED | Chuyển BLACKLISTED nhưng thiếu `reason` |
| 400 | INVALID_STATUS | Status không thuộc enum cho phép |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Role không đủ quyền |

---

## Entity liên quan

- **Table**: `vendors`
- **Service method**: `VendorsService.changeStatus(id, dto, currentUser)`
