# POST /api/v1/products/:id/market-prices

## Mô tả
Thêm giá bán theo thị trường cho sản phẩm. Mỗi bản ghi gồm: thị trường, tiền tệ, Incoterms và giá bán. Dùng để quản lý chính sách giá xuất khẩu theo từng thị trường và điều khoản giao hàng.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `sales`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `marketCode` | string | ✅ | Mã thị trường uppercase, max 10 (vd: `US`, `EU`, `JP`, `ASEAN`) |
| `currency` | string | ✅ | Tiền tệ, ISO 4217, 3 ký tự uppercase (USD, EUR, JPY...) |
| `incoterms` | enum | ✅ | `EXW` \| `FOB` \| `CIF` \| `CFR` \| `CPT` \| `CIP` \| `DDP` \| `DAP` \| `FCA` |
| `salePrice` | number | ✅ | Giá bán, > 0 |
| `minOrderQty` | number | ❌ | Số lượng đặt tối thiểu (MOQ) theo base unit |
| `effectiveFrom` | string (ISO date) | ✅ | Ngày áp dụng |
| `effectiveTo` | string (ISO date) | ❌ | Ngày hết hạn (null = đang hiệu lực) |
| `notes` | string | ❌ | Ghi chú, max 500 ký tự |

**Ví dụ:**
```json
{
  "marketCode": "US",
  "currency": "USD",
  "incoterms": "CIF",
  "salePrice": 5.20,
  "minOrderQty": 1000,
  "effectiveFrom": "2026-04-01",
  "notes": "Giá CIF Los Angeles, tàu VIMC, cước ~$180/MT"
}
```

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc đã soft-delete.
2. `salePrice` > 0.
3. `effectiveTo` nếu có phải > `effectiveFrom`.
4. Unique constraint `(productId, marketCode, incoterms, effectiveFrom)` — trả 409 nếu đã tồn tại bản ghi với cùng tổ hợp này.
5. Cho phép cùng `(productId, marketCode, incoterms)` với `effectiveFrom` khác nhau — lịch sử giá.
6. `createdBy` lấy từ JWT.

---

## Response (201 Created)

```json
{
  "data": {
    "id": "uuid-price-...",
    "productId": "uuid-product-...",
    "marketCode": "US",
    "currency": "USD",
    "incoterms": "CIF",
    "salePrice": 5.20,
    "minOrderQty": 1000,
    "effectiveFrom": "2026-04-01",
    "effectiveTo": null,
    "notes": "Giá CIF Los Angeles, tàu VIMC, cước ~$180/MT",
    "createdBy": "uuid-user-...",
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 409 | MARKET_PRICE_EXISTS | Trùng (marketCode, incoterms, effectiveFrom) |
| 400 | INVALID_PRICE | `salePrice` <= 0 |
| 400 | INVALID_DATE_RANGE | `effectiveTo` <= `effectiveFrom` |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `product_market_prices`
- **Service method**: `ProductsService.addMarketPrice(productId, dto, currentUser)`
