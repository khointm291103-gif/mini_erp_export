# DELETE /api/v1/auth/users/:id/sessions/:sessionId

## Mô tả
Revoke một phiên đăng nhập cụ thể (xóa một refresh token). Admin dùng để đăng xuất user khỏi một thiết bị cụ thể. User cũng có thể tự revoke session của mình.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, hoặc chính user đó.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID user |
| `sessionId` | UUID | ID session (bản ghi trong `user_refresh_tokens`) |

---

## Business Rules

1. Trả 404 nếu user không tồn tại hoặc session không tồn tại.
2. Session phải thuộc về user có `id = :id` — trả 404 nếu không khớp.
3. User thường chỉ revoke được session của chính mình. Admin revoke được của bất kỳ user nào.
4. Nếu session đã hết hạn — vẫn trả 200 (idempotent).

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Phiên đăng nhập đã được thu hồi."
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | USER_NOT_FOUND | User không tồn tại |
| 404 | SESSION_NOT_FOUND | Session không tồn tại hoặc không thuộc user |
| 403 | FORBIDDEN | User thường cố revoke session của người khác |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `user_refresh_tokens`
- **Service method**: `AuthService.revokeSession(userId, sessionId, currentUser)`
