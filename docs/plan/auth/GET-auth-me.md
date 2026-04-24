# GET /api/v1/auth/me

## Mô tả
Lấy thông tin profile của user đang đăng nhập dựa trên JWT. Dùng để frontend load thông tin user sau khi login hoặc refresh trang.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`.

---

## Request

Không có body, không có query params.

---

## Business Rules

1. Lấy `userId` từ JWT payload (`sub`).
2. Query user từ DB — không dùng data trong JWT vì có thể stale (role có thể đã thay đổi).
3. Trả 401 nếu user không còn tồn tại trong DB (đã bị xóa sau khi token được cấp).
4. Trả 403 nếu user `status = INACTIVE` hoặc `SUSPENDED`.
5. Không trả `passwordHash`.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-user-...",
    "email": "nguyen.mua.hang@company.vn",
    "fullName": "Nguyễn Mua Hàng",
    "role": "purchasing",
    "phone": "0901234567",
    "department": "Phòng Mua Hàng",
    "status": "ACTIVE",
    "lastLoginAt": "2026-04-23T08:00:00.000Z",
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 401 | UNAUTHORIZED | JWT thiếu, hết hạn, hoặc user không còn tồn tại |
| 403 | ACCOUNT_INACTIVE | Tài khoản bị vô hiệu hóa |

---

## Entity liên quan

- **Table**: `users`
- **Service method**: `AuthService.getMe(userId)`
