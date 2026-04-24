# GET /api/v1/products/:id/market-prices

## Mô tả
Lấy danh sách giá bán theo thị trường của một sản phẩm. Có thể lọc chỉ giá đang hiệu lực hoặc theo thị trường cụ thể.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `active` | boolean | — | `true` = chỉ bản ghi đang hiệu lực |
| `marketCode` | string | — | Lọc theo thị trường (vd: `US`, `EU`) |
| `incoterms` | enum | — | Lọc theo điều khoản giao hàng |
| `currency` | string | — | Lọc theo loại tiền |
| `sortBy` | string | `effectiveFrom` | `effectiveFrom` \| `salePrice` \| `marketCode` |
| `order` | string | `DESC` | `ASC` \| `DESC` |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc đã soft-delete.
2. `active=true`: `WHERE (effective_to IS NULL OR effective_to >= CURRENT_DATE)`.
3. Không phân trang — số lượng market price thường nhỏ (< 50 bản ghi/sản phẩm).

---

## Response (200 OK)

```json
{
  "data": [
    {
      "id": "uuid-price-1",
      "marketCode": "US",
      "currency": "USD",
      "incoterms": "CIF",
      "salePrice": 5.20,
      "minOrderQty": 1000,
      "effectiveFrom": "2026-04-01",
      "effectiveTo": null,
      "notes": "Giá CIF Los Angeles"
    },
    {
      "id": "uuid-price-2",
      "marketCode": "EU",
      "currency": "EUR",
      "incoterms": "CIF",
      "salePrice": 4.80,
      "minOrderQty": 2000,
      "effectiveFrom": "2026-03-01",
      "effectiveTo": null,
      "notes": "Giá CIF Rotterdam"
    }
  ],
  "meta": {
    "total": 5
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `product_market_prices`
- **Service method**: `ProductsService.getMarketPrices(productId, query)`
