# PATCH /api/v1/products/:id/market-prices/:priceId

## Mô tả
Cập nhật hoặc đóng một bản ghi giá bán theo thị trường. Dùng phổ biến nhất để set `effectiveTo` khi giá cũ hết hạn.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `sales`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |
| `priceId` | UUID | ID bản ghi giá thị trường |

### Body (JSON) — tất cả optional

| Field | Type | Mô tả |
|---|---|---|
| `effectiveTo` | string (ISO date) | Ngày đóng bản ghi giá |
| `minOrderQty` | number | Cập nhật MOQ |
| `notes` | string | Cập nhật ghi chú |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc `priceId` không thuộc sản phẩm này.
2. Không cho phép thay đổi `marketCode`, `currency`, `incoterms`, `salePrice`, `effectiveFrom` — các field này immutable sau khi tạo (tạo bản ghi mới nếu giá thay đổi).
3. `effectiveTo` nếu cập nhật phải >= `effectiveFrom` của bản ghi.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-price-...",
    "marketCode": "US",
    "incoterms": "CIF",
    "salePrice": 5.20,
    "effectiveFrom": "2026-04-01",
    "effectiveTo": "2026-06-30",
    "notes": "Đóng giá Q2, áp giá mới từ Q3"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 404 | MARKET_PRICE_NOT_FOUND | priceId không tồn tại hoặc không thuộc sản phẩm |
| 400 | INVALID_DATE | `effectiveTo` < `effectiveFrom` |
| 400 | IMMUTABLE_FIELD | Cố thay đổi `salePrice`, `marketCode`, v.v. |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `product_market_prices`
- **Service method**: `ProductsService.updateMarketPrice(productId, priceId, dto)`
