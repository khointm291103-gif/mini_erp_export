# POST /api/v1/auth/refresh

## Mô tả
Làm mới access token bằng refresh token còn hiệu lực. Dùng khi access token hết hạn (sau 15 phút) mà không muốn user phải đăng nhập lại.

## Authentication
Không yêu cầu JWT — dùng refresh token trong body.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `refreshToken` | string | ✅ | Refresh token nhận được khi login |

**Ví dụ:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Business Rules

1. Verify chữ ký JWT của `refreshToken` bằng `JWT_SECRET`.
2. Trả 401 nếu token hết hạn hoặc chữ ký không hợp lệ.
3. Kiểm tra hash của `refreshToken` trong bảng `user_refresh_tokens` — trả 401 nếu không tìm thấy (đã bị revoke).
4. Kiểm tra user vẫn `ACTIVE` — trả 403 nếu bị vô hiệu hóa.
5. **Rotation**: xóa refresh token cũ, tạo cặp token mới (access + refresh). Trả về cả hai.
6. Nếu cùng refresh token được dùng 2 lần (replay attack): revoke toàn bộ refresh tokens của user đó và trả 401.

---

## Response (200 OK)

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 401 | INVALID_REFRESH_TOKEN | Token không hợp lệ, hết hạn, hoặc đã bị revoke |
| 401 | TOKEN_REUSE_DETECTED | Phát hiện replay attack — toàn bộ sessions bị revoke |
| 403 | ACCOUNT_INACTIVE | Tài khoản bị vô hiệu hóa |

---

## Entity liên quan

- **Table**: `users`, `user_refresh_tokens`
- **Service method**: `AuthService.refreshToken(dto)`
