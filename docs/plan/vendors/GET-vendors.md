# GET /api/v1/vendors

## Mô tả
Lấy danh sách nhà cung cấp có phân trang, tìm kiếm và lọc. Trả về tổng hợp điểm đánh giá (overallScore) cho mỗi vendor.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `page` | integer | 1 | Trang hiện tại |
| `limit` | integer | 20 | Số bản ghi/trang, max 100 |
| `search` | string | — | Tìm kiếm theo `name`, `taxCode`, `contactName`, `vendorCode` |
| `status` | enum | — | `ACTIVE` \| `INACTIVE` \| `BLACKLISTED` |
| `industry` | string | — | Lọc theo ngành hàng (exact match, case-insensitive) |
| `paymentTerms` | enum | — | `IMMEDIATE` \| `NET_30` \| `NET_60` \| `NET_90` \| `CUSTOM` |
| `sortBy` | string | `createdAt` | `name` \| `vendorCode` \| `createdAt` \| `overallScore` |
| `order` | string | `DESC` | `ASC` \| `DESC` |

**Ví dụ:**
```
GET /api/v1/vendors?search=thủy sản&status=ACTIVE&page=1&limit=20&sortBy=name&order=ASC
```

---

## Business Rules

1. Chỉ trả về vendors chưa bị soft-delete (`deletedAt IS NULL`).
2. `search` dùng `ILIKE '%keyword%'` trên các cột `name`, `taxCode`, `contactName`, `vendorCode`.
3. `overallScore` là trung bình cộng của tất cả `vendor_ratings.overall_score` theo vendorId — tính bằng subquery hoặc LEFT JOIN.
4. Nếu vendor chưa có đánh giá nào, `overallScore = null`.
5. Kết quả không bao gồm payables, price history, ratings chi tiết — chỉ trả summary.

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-...",
      "vendorCode": "VND-0001",
      "name": "Công ty TNHH Thủy Sản Miền Nam",
      "taxCode": "0312345678",
      "city": "TP. Hồ Chí Minh",
      "industry": "Thủy sản",
      "contactName": "Nguyễn Văn A",
      "contactPhone": "0901234567",
      "paymentTerms": "NET_30",
      "paymentDueDays": 30,
      "status": "ACTIVE",
      "overallScore": 4.2,
      "createdAt": "2026-04-23T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | VALIDATION_ERROR | `page` hoặc `limit` không phải số nguyên dương |
| 400 | VALIDATION_ERROR | `sortBy` không thuộc danh sách cho phép |
| 401 | UNAUTHORIZED | Không có hoặc JWT hết hạn |

---

## Entity liên quan

- **Table chính**: `vendors`
- **Table phụ**: `vendor_ratings` (LEFT JOIN để tính overallScore)
- **Service method**: `VendorsService.findAll(query)`
