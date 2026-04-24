# GET /api/v1/auth/users/:id/sessions

## Mô tả
Xem danh sách các phiên đăng nhập (refresh tokens) đang hoạt động của một user. Admin dùng để kiểm tra hoặc audit.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, hoặc chính user đó (xem sessions của mình).

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID user |

---

## Business Rules

1. Trả 404 nếu user không tồn tại.
2. User thường chỉ xem được sessions của chính mình (`id = currentUser.id`). Admin xem được của bất kỳ user nào.
3. Không trả về `tokenHash` — chỉ trả metadata (device, IP, thời gian).
4. Chỉ trả sessions chưa hết hạn (`expiresAt > NOW()`).

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-session-...",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "ipAddress": "192.168.1.100",
      "createdAt": "2026-04-23T08:00:00.000Z",
      "expiresAt": "2026-04-30T08:00:00.000Z",
      "isCurrent": true
    },
    {
      "id": "uuid-session-2",
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)...",
      "ipAddress": "113.161.45.22",
      "createdAt": "2026-04-22T14:00:00.000Z",
      "expiresAt": "2026-04-29T14:00:00.000Z",
      "isCurrent": false
    }
  ]
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | USER_NOT_FOUND | User không tồn tại |
| 403 | FORBIDDEN | User thường cố xem sessions của người khác |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `user_refresh_tokens`
- **Service method**: `AuthService.getUserSessions(targetUserId, currentUser)`

---

## Ghi chú implementation

Bảng `user_refresh_tokens` cần thêm các cột: `userAgent`, `ipAddress`, `expiresAt`. Lưu `userAgent` và `ipAddress` từ request khi tạo refresh token lúc login.
