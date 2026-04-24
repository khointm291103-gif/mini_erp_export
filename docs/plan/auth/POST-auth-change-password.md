# POST /api/v1/auth/change-password

## Mô tả
Đổi mật khẩu của user đang đăng nhập. Yêu cầu nhập mật khẩu cũ để xác nhận danh tính.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `currentPassword` | string | ✅ | Mật khẩu hiện tại |
| `newPassword` | string | ✅ | Mật khẩu mới, min 8 ký tự, phải có chữ hoa, chữ thường, số |
| `confirmPassword` | string | ✅ | Xác nhận mật khẩu mới — phải khớp với `newPassword` |

**Ví dụ:**
```json
{
  "currentPassword": "Secure@2026",
  "newPassword": "NewSecure@2026",
  "confirmPassword": "NewSecure@2026"
}
```

---

## Business Rules

1. Verify `currentPassword` với `passwordHash` trong DB bằng `bcryptjs.compare()`.
2. Trả 400 nếu `currentPassword` sai.
3. Trả 400 nếu `newPassword` = `currentPassword` (không cho đổi sang mật khẩu giống cũ).
4. Trả 400 nếu `newPassword` != `confirmPassword`.
5. Hash `newPassword` với `bcryptjs` (`saltRounds = 10`) trước khi lưu.
6. Sau khi đổi mật khẩu thành công: revoke toàn bộ refresh tokens của user (buộc đăng nhập lại trên tất cả thiết bị).
7. Response không trả về token mới — user phải login lại.

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | WRONG_CURRENT_PASSWORD | Mật khẩu hiện tại không đúng |
| 400 | SAME_PASSWORD | Mật khẩu mới trùng với mật khẩu cũ |
| 400 | PASSWORD_MISMATCH | `newPassword` và `confirmPassword` không khớp |
| 400 | WEAK_PASSWORD | Mật khẩu mới không đủ độ phức tạp |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `users`, `user_refresh_tokens`
- **Service method**: `AuthService.changePassword(userId, dto)`
