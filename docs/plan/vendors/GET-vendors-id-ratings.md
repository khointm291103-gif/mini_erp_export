# GET /api/v1/vendors/:id/ratings

## Mô tả
Lấy danh sách tất cả đánh giá của nhà cung cấp, sắp xếp theo kỳ mới nhất trước.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `page` | integer | 1 | Trang hiện tại |
| `limit` | integer | 12 | Số bản ghi/trang (12 = 1 năm), max 60 |
| `fromPeriod` | string | — | Lọc từ kỳ này (YYYY-MM), bao gồm |
| `toPeriod` | string | — | Lọc đến kỳ này (YYYY-MM), bao gồm |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Sắp xếp mặc định: `ratingPeriod DESC` (kỳ mới nhất trước).
3. `fromPeriod` và `toPeriod` dùng string comparison vì format `YYYY-MM` sắp xếp đúng alphabetically.

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-rating-...",
      "ratingPeriod": "2026-03",
      "qualityScore": 4,
      "deliveryScore": 5,
      "priceScore": 4,
      "overallScore": 4.33,
      "onTimeDeliveryRate": 96.5,
      "defectRate": 0.5,
      "notes": "Giao hàng tốt trong kỳ",
      "ratedBy": {
        "id": "uuid-user-...",
        "name": "Nguyễn Mua Hàng"
      },
      "createdAt": "2026-04-23T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 6,
    "page": 1,
    "limit": 12,
    "totalPages": 1
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 400 | INVALID_PERIOD_FORMAT | `fromPeriod` hoặc `toPeriod` sai format YYYY-MM |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `vendor_ratings`
- **JOIN**: `users` (ratedBy name)
- **Service method**: `VendorsService.getRatings(vendorId, query)`
