# POST /api/v1/auth/login

## Mô tả
Đăng nhập bằng email và password. Trả về JWT access token và refresh token.

## Authentication
Không yêu cầu — endpoint công khai.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `email` | string | ✅ | Email đăng nhập |
| `password` | string | ✅ | Mật khẩu |

**Ví dụ:**
```json
{
  "email": "nguyen.mua.hang@company.vn",
  "password": "Secure@2026"
}
```

---

## Business Rules

1. Tìm user theo `email` (case-insensitive).
2. Trả 401 nếu email không tồn tại — **không tiết lộ** email có tồn tại hay không (dùng cùng message chung).
3. So sánh password với `passwordHash` bằng `bcryptjs.compare()`.
4. Trả 401 nếu password sai — cùng message với email không tồn tại (tránh user enumeration).
5. Trả 403 nếu user có `status = INACTIVE` hoặc `SUSPENDED`.
6. `accessToken` có thời hạn `15m` (ngắn, bảo mật cao).
7. `refreshToken` có thời hạn `7d`, lưu hash vào DB (bảng `user_refresh_tokens`) để có thể revoke.
8. Ghi nhận `lastLoginAt = NOW()` vào bảng `users`.

---

## Response (200 OK)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": {
      "id": "uuid-user-...",
      "email": "nguyen.mua.hang@company.vn",
      "fullName": "Nguyễn Mua Hàng",
      "role": "purchasing",
      "department": "Phòng Mua Hàng"
    }
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 401 | INVALID_CREDENTIALS | Email hoặc password sai (cùng message, không phân biệt) |
| 403 | ACCOUNT_INACTIVE | Tài khoản bị vô hiệu hóa hoặc tạm khóa |
| 400 | VALIDATION_ERROR | Thiếu email hoặc password |

---

## JWT Payload

```json
{
  "sub": "uuid-user-...",
  "email": "nguyen.mua.hang@company.vn",
  "role": "purchasing",
  "iat": 1745400000,
  "exp": 1745400900
}
```

---

## Entity liên quan

- **Table**: `users`, `user_refresh_tokens`
- **Service method**: `AuthService.login(dto)`
