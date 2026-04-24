# PATCH /api/v1/auth/users/:id

## Mô tả
Admin cập nhật thông tin user khác: role, status, department. Không dùng để đổi password (có API riêng).

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID user cần cập nhật |

### Body (JSON) — tất cả optional

| Field | Type | Mô tả |
|---|---|---|
| `fullName` | string | Họ tên, max 150 ký tự |
| `phone` | string | Số điện thoại |
| `department` | string | Phòng ban |
| `role` | enum | `admin` \| `purchasing` \| `purchasing_manager` \| `sales` \| `accountant` \| `logistics` \| `warehouse` |
| `status` | enum | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` |

---

## Business Rules

1. Trả 404 nếu user không tồn tại.
2. Admin không thể tự hạ cấp role của chính mình (tránh lock out).
3. Admin không thể tự set `status = INACTIVE` cho chính mình.
4. Khi `status` chuyển sang `INACTIVE` hoặc `SUSPENDED`: revoke toàn bộ refresh tokens của user đó (buộc đăng xuất ngay).
5. `email` và `passwordHash` không thể thay đổi qua API này.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-user-...",
    "email": "nguyen.mua.hang@company.vn",
    "fullName": "Nguyễn Mua Hàng",
    "role": "purchasing_manager",
    "status": "ACTIVE",
    "updatedAt": "2026-04-23T11:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | USER_NOT_FOUND | User không tồn tại |
| 400 | CANNOT_DEMOTE_SELF | Admin tự hạ cấp role của mình |
| 400 | CANNOT_DEACTIVATE_SELF | Admin tự vô hiệu hóa tài khoản mình |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `users`, `user_refresh_tokens`
- **Service method**: `UsersService.updateUser(id, dto, currentUser)`
