# GET /api/v1/auth/users/:id

## Mô tả
Lấy thông tin chi tiết của một user cụ thể. Admin dùng để xem profile và trạng thái tài khoản.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID user |

---

## Business Rules

1. Trả 404 nếu user không tồn tại hoặc đã soft-delete.
2. Không trả về `passwordHash`.
3. Đính kèm số lượng sessions đang active.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-user-...",
    "email": "nguyen.mua.hang@company.vn",
    "fullName": "Nguyễn Mua Hàng",
    "role": "purchasing",
    "phone": "0901234567",
    "department": "Phòng Mua Hàng",
    "status": "ACTIVE",
    "mustChangePassword": false,
    "lastLoginAt": "2026-04-23T08:00:00.000Z",
    "activeSessions": 2,
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-04-23T08:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | USER_NOT_FOUND | User không tồn tại hoặc đã xóa |
| 400 | INVALID_UUID | `:id` không phải UUID hợp lệ |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `users`, `user_refresh_tokens` (count active sessions)
- **Service method**: `UsersService.findOne(id)`
