# DELETE /api/v1/vendors/:id

## Mô tả
Soft-delete nhà cung cấp. Ghi `deletedAt = NOW()` vào database — không xóa vật lý. Vendor bị xóa sẽ không hiển thị trong danh sách, nhưng dữ liệu lịch sử (price history, payables, ratings) vẫn được giữ nguyên để audit.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID của nhà cung cấp cần xóa |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã bị soft-delete.
2. **Không cho phép xóa** nếu vendor còn payables chưa thanh toán (`status IN ('PENDING', 'PARTIAL', 'OVERDUE')`) — trả 409.
3. **Không cho phép xóa** nếu vendor đang là `defaultVendorId` của bất kỳ product nào đang `ACTIVE` — trả 409.
4. Nếu vendor bị xóa, các `vendor_price_histories` và `vendor_ratings` vẫn giữ nguyên trong DB (chỉ không hiển thị trong list).
5. Không hard-delete trong bất kỳ trường hợp nào.

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Vendor VND-0001 đã được xóa thành công.",
    "deletedAt": "2026-04-23T12:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa trước đó |
| 409 | VENDOR_HAS_PENDING_PAYABLES | Còn công nợ chưa thanh toán |
| 409 | VENDOR_IS_DEFAULT_SUPPLIER | Đang là nhà cung cấp mặc định của sản phẩm đang active |
| 400 | INVALID_UUID | `:id` không phải UUID hợp lệ |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin mới được xóa |

---

## Entity liên quan

- **Table**: `vendors` (set `deletedAt`)
- **Check**: `vendor_payables` (kiểm tra pending), `products` (kiểm tra defaultVendorId)
- **Service method**: `VendorsService.softDelete(id)`
