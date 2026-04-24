# POST /api/v1/vendors/:id/ratings

## Mô tả
Tạo đánh giá định kỳ cho nhà cung cấp theo tháng. Mỗi nhà cung cấp chỉ có một bản đánh giá cho mỗi tháng.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`, `purchasing_manager`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID nhà cung cấp |

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `ratingPeriod` | string | ✅ | Kỳ đánh giá, format `YYYY-MM` (vd: `2026-03`) |
| `qualityScore` | integer | ✅ | Điểm chất lượng hàng hóa, 1–5 |
| `deliveryScore` | integer | ✅ | Điểm giao hàng đúng hạn, 1–5 |
| `priceScore` | integer | ✅ | Điểm cạnh tranh về giá, 1–5 |
| `onTimeDeliveryRate` | number | ❌ | % giao đúng hạn trong kỳ (0–100) |
| `defectRate` | number | ❌ | % hàng lỗi/hỏng trong kỳ (0–100) |
| `notes` | string | ❌ | Nhận xét chi tiết |

**Ví dụ:**
```json
{
  "ratingPeriod": "2026-03",
  "qualityScore": 4,
  "deliveryScore": 5,
  "priceScore": 4,
  "onTimeDeliveryRate": 96.5,
  "defectRate": 0.5,
  "notes": "Giao hàng tốt, chất lượng ổn định, giá hơi cao so với thị trường"
}
```

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. `ratingPeriod` phải đúng format `YYYY-MM` — validate bằng regex `^\d{4}-(0[1-9]|1[0-2])$`.
3. Unique constraint `(vendorId, ratingPeriod)` — trả 409 nếu đã có đánh giá cho tháng đó.
4. `overallScore` = `(qualityScore + deliveryScore + priceScore) / 3`, làm tròn 2 chữ số thập phân. Tính trong service trước khi lưu.
5. `ratedBy` lấy từ JWT của user đang đăng nhập.
6. Không giới hạn kỳ đánh giá phải là tháng hiện tại — cho phép nhập đánh giá tháng trước.

---

## Response (201 Created)

```json
{
  "data": {
    "id": "uuid-rating-...",
    "vendorId": "uuid-vendor-...",
    "ratingPeriod": "2026-03",
    "qualityScore": 4,
    "deliveryScore": 5,
    "priceScore": 4,
    "overallScore": 4.33,
    "onTimeDeliveryRate": 96.5,
    "defectRate": 0.5,
    "notes": "Giao hàng tốt, chất lượng ổn định, giá hơi cao so với thị trường",
    "ratedBy": "uuid-user-...",
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 409 | RATING_PERIOD_EXISTS | Đã có đánh giá cho kỳ này |
| 400 | INVALID_PERIOD_FORMAT | `ratingPeriod` sai format |
| 400 | INVALID_SCORE | Score ngoài khoảng 1–5 |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `vendor_ratings`
- **Service method**: `VendorsService.createRating(vendorId, dto, currentUser)`
