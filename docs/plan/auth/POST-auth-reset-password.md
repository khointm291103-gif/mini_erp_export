# POST /api/v1/auth/reset-password

## Mô tả
Admin đặt lại mật khẩu cho user khác (khi user quên mật khẩu). Không cần nhập mật khẩu cũ. Sau khi reset, user phải đổi mật khẩu ở lần đăng nhập tiếp theo.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `userId` | UUID | ✅ | ID user cần reset mật khẩu |
| `newPassword` | string | ✅ | Mật khẩu mới, min 8 ký tự, phải có chữ hoa, chữ thường, số |

**Ví dụ:**
```json
{
  "userId": "uuid-user-...",
  "newPassword": "TempPass@2026"
}
```

---

## Business Rules

1. Trả 404 nếu `userId` không tồn tại.
2. Admin không thể dùng API này để reset mật khẩu của chính mình — dùng `POST /auth/change-password`.
3. Hash `newPassword` với `bcryptjs` trước khi lưu.
4. Set `mustChangePassword = true` trên user — frontend sẽ redirect đến trang đổi mật khẩu sau khi login.
5. Revoke toàn bộ refresh tokens của user đó (buộc đăng xuất tất cả thiết bị).

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Đặt lại mật khẩu thành công. User sẽ được yêu cầu đổi mật khẩu khi đăng nhập lại."
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | USER_NOT_FOUND | `userId` không tồn tại |
| 400 | CANNOT_RESET_OWN_PASSWORD | Admin tự reset mật khẩu của mình |
| 400 | WEAK_PASSWORD | Mật khẩu mới không đủ độ phức tạp |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `users` (update `passwordHash`, `mustChangePassword`), `user_refresh_tokens` (revoke all)
- **Service method**: `AuthService.resetPassword(dto, currentUser)`
