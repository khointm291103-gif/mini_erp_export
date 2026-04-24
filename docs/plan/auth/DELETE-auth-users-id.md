# DELETE /api/v1/auth/users/:id

## Mô tả
Soft-delete một user. Ghi `deletedAt = NOW()`. User bị xóa không thể đăng nhập và không hiển thị trong danh sách.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID user cần xóa |

---

## Business Rules

1. Trả 404 nếu user không tồn tại hoặc đã bị soft-delete.
2. Admin không thể tự xóa chính mình — trả 400.
3. Revoke toàn bộ refresh tokens của user trước khi xóa.
4. Set `status = INACTIVE` và `deletedAt = NOW()`.
5. Không hard-delete — giữ lại để audit trail (ai tạo PO, ai duyệt...).

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Tài khoản đã được xóa.",
    "deletedAt": "2026-04-23T12:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | USER_NOT_FOUND | User không tồn tại hoặc đã xóa |
| 400 | CANNOT_DELETE_SELF | Admin tự xóa tài khoản mình |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `users`, `user_refresh_tokens`
- **Service method**: `UsersService.softDelete(id, currentUser)`
