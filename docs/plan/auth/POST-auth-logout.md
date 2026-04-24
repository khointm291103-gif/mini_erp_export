# POST /api/v1/auth/logout

## Mô tả
Đăng xuất — revoke refresh token hiện tại. Access token vẫn còn hiệu lực đến khi hết hạn (15 phút) nhưng refresh token bị xóa khỏi DB nên không thể gia hạn thêm.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>` (access token).

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `refreshToken` | string | ✅ | Refresh token cần revoke |

---

## Business Rules

1. Xóa bản ghi `user_refresh_tokens` tương ứng với `refreshToken` được gửi lên.
2. Nếu `refreshToken` không tìm thấy trong DB — vẫn trả 200 (idempotent, không báo lỗi).
3. Chỉ revoke refresh token của chính user đang đăng nhập (lấy `userId` từ JWT) — không cho phép revoke token của user khác.

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Đăng xuất thành công."
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
- **Service method**: `AuthService.logout(userId, refreshToken)`
