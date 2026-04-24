# PATCH /api/v1/auth/me

## Mô tả
Cập nhật thông tin profile của user đang đăng nhập. Chỉ cho phép sửa các field cá nhân — không cho phép tự đổi role hay status.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`.

---

## Request

### Body (JSON) — tất cả optional

| Field | Type | Mô tả |
|---|---|---|
| `fullName` | string | Họ tên đầy đủ, max 150 ký tự |
| `phone` | string | Số điện thoại, max 30 ký tự |
| `department` | string | Phòng ban, max 100 ký tự |

**Ví dụ:**
```json
{
  "fullName": "Nguyễn Văn Mua Hàng",
  "phone": "0909999999"
}
```

---

## Business Rules

1. Chỉ cập nhật `fullName`, `phone`, `department` — các field khác bị ignore.
2. `email`, `role`, `status` không thể thay đổi qua API này.
3. `updatedAt` tự động cập nhật.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-user-...",
    "email": "nguyen.mua.hang@company.vn",
    "fullName": "Nguyễn Văn Mua Hàng",
    "phone": "0909999999",
    "department": "Phòng Mua Hàng",
    "updatedAt": "2026-04-23T11:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | VALIDATION_ERROR | Sai định dạng field |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `users`
- **Service method**: `AuthService.updateMe(userId, dto)`
