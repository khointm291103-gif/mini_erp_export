# POST /api/v1/auth/register

## Mô tả
Đăng ký tài khoản người dùng mới trong hệ thống. Chỉ admin mới được tạo tài khoản — không có self-registration công khai.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `email` | string | ✅ | Email đăng nhập, unique, phải đúng định dạng |
| `password` | string | ✅ | Mật khẩu, min 8 ký tự, phải có chữ hoa, chữ thường, số |
| `fullName` | string | ✅ | Họ tên đầy đủ, max 150 ký tự |
| `role` | enum | ✅ | `admin` \| `purchasing` \| `purchasing_manager` \| `sales` \| `accountant` \| `logistics` \| `warehouse` |
| `phone` | string | ❌ | Số điện thoại, max 30 ký tự |
| `department` | string | ❌ | Phòng ban, max 100 ký tự |

**Ví dụ:**
```json
{
  "email": "nguyen.mua.hang@company.vn",
  "password": "Secure@2026",
  "fullName": "Nguyễn Mua Hàng",
  "role": "purchasing",
  "phone": "0901234567",
  "department": "Phòng Mua Hàng"
}
```

---

## Business Rules

1. `email` phải unique — trả 409 nếu đã tồn tại.
2. Password được hash bằng `bcryptjs` với `saltRounds = 10` trước khi lưu. Không bao giờ lưu plain text.
3. `status` mặc định `ACTIVE` khi tạo.
4. Response không bao giờ trả về `passwordHash`.
5. Chỉ `admin` mới được gọi API này — không có public registration.

---

## Response (201 Created)

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
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 409 | EMAIL_EXISTS | Email đã tồn tại trong hệ thống |
| 400 | WEAK_PASSWORD | Password không đủ độ phức tạp |
| 400 | INVALID_ROLE | Role không thuộc danh sách cho phép |
| 400 | VALIDATION_ERROR | Thiếu field bắt buộc hoặc sai định dạng |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin mới được tạo tài khoản |

---

## Entity liên quan

- **Table**: `users`
- **Service method**: `AuthService.register(dto, currentUser)`
