# POST /api/v1/auth/logout-all

## Mô tả
Đăng xuất khỏi tất cả thiết bị — revoke toàn bộ refresh tokens của user hiện tại. Dùng khi nghi ngờ tài khoản bị xâm phạm.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`.

---

## Request

Không có body.

---

## Business Rules

1. Xóa tất cả bản ghi trong `user_refresh_tokens` có `userId = currentUser.id`.
2. Access tokens hiện tại vẫn còn hiệu lực đến khi hết hạn (15 phút) — không thể revoke access token vì stateless.
3. Trả về số lượng sessions đã bị revoke.

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Đã đăng xuất khỏi tất cả thiết bị.",
    "revokedSessions": 3
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 401 | UNAUTHORIZED | Access token thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `user_refresh_tokens`
- **Service method**: `AuthService.logoutAll(userId)`
