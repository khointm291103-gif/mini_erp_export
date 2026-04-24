# GET /api/v1/vendors/:id/ratings/summary

## Mô tả
Tổng hợp điểm đánh giá trung bình của nhà cung cấp theo tất cả kỳ (hoặc trong khoảng thời gian chỉ định). Dùng cho dashboard và báo cáo đánh giá nhà cung cấp.

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
| `fromPeriod` | string | — | Tính từ kỳ này (YYYY-MM) |
| `toPeriod` | string | — | Tính đến kỳ này (YYYY-MM) |

---

## Business Rules

1. Trả 404 nếu vendor không tồn tại hoặc đã soft-delete.
2. Nếu vendor chưa có đánh giá nào, trả về `totalRatings: 0` và tất cả score là `null`.
3. `trend`: so sánh `overallScore` trung bình 3 kỳ gần nhất vs 3 kỳ trước đó → `UP` / `DOWN` / `STABLE` / `INSUFFICIENT_DATA`.
4. Tính toán hoàn toàn ở service layer bằng SQL aggregate.

---

## Response (200 OK)

```json
{
  "data": {
    "vendorId": "uuid-vendor-...",
    "vendorCode": "VND-0001",
    "name": "Công ty TNHH Thủy Sản Miền Nam",
    "totalRatings": 6,
    "periodRange": {
      "from": "2025-10",
      "to": "2026-03"
    },
    "averageScores": {
      "qualityScore": 4.17,
      "deliveryScore": 4.50,
      "priceScore": 3.83,
      "overallScore": 4.17
    },
    "averageOnTimeDeliveryRate": 94.2,
    "averageDefectRate": 0.8,
    "trend": "UP",
    "latestPeriod": "2026-03"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | VENDOR_NOT_FOUND | Vendor không tồn tại hoặc đã xóa |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `vendor_ratings`
- **Service method**: `VendorsService.getRatingsSummary(vendorId, query)`

---

## Ghi chú implementation

```sql
SELECT
  COUNT(*) as total_ratings,
  AVG(quality_score) as avg_quality,
  AVG(delivery_score) as avg_delivery,
  AVG(price_score) as avg_price,
  AVG(overall_score) as avg_overall,
  AVG(on_time_delivery_rate) as avg_on_time,
  AVG(defect_rate) as avg_defect
FROM vendor_ratings
WHERE vendor_id = $1
  AND ($2::varchar IS NULL OR rating_period >= $2)
  AND ($3::varchar IS NULL OR rating_period <= $3)
```
