# GET /api/v1/auth/users

## Mô tả
Lấy danh sách tất cả user trong hệ thống. Chỉ admin mới được xem.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `page` | integer | 1 | Trang hiện tại |
| `limit` | integer | 20 | Số bản ghi/trang, max 100 |
| `search` | string | — | Tìm theo `email`, `fullName` |
| `role` | enum | — | Lọc theo role |
| `status` | enum | — | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` |
| `sortBy` | string | `createdAt` | `fullName` \| `email` \| `createdAt` \| `lastLoginAt` |
| `order` | string | `DESC` | `ASC` \| `DESC` |

---

## Business Rules

1. Không trả về `passwordHash` trong bất kỳ trường hợp nào.
2. Chỉ trả về users chưa bị hard-delete (`deletedAt IS NULL`).

---

## Response (200 OK)

```json
{
  "data": [
    {
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
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `users`
- **Service method**: `UsersService.findAll(query)`
