# GET /api/v1/products/:id

## Mô tả
Lấy thông tin đầy đủ của một sản phẩm, bao gồm tất cả giá bán theo thị trường, thông tin nhà cung cấp mặc định và các nhà cung cấp đang cung cấp sản phẩm này.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc đã soft-delete.
2. `marketPrices` chỉ trả về các bản ghi đang hiệu lực (`effectiveTo IS NULL OR effectiveTo >= today`).
3. `currentVendorPrices` trả về danh sách nhà cung cấp và giá mua hiện tại từ bảng `vendor_price_histories`.
4. Role `accountant` và `admin` thấy `defaultPurchasePriceVnd` và `currentVendorPrices`. Role `sales` và `logistics` không thấy giá mua.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-product-...",
    "productCode": "PRD-0042",
    "name": "Tôm thẻ chân trắng đông lạnh HOSO",
    "nameEn": "Frozen Vannamei Shrimp HOSO",
    "descriptionEn": "Frozen white leg shrimp, head-on shell-on, IQF, size 21/25",
    "category": { "id": "uuid-...", "code": "CAT-012", "name": "Thủy sản đông lạnh", "nameEn": "Frozen Seafood" },
    "baseUnit": { "id": "uuid-...", "code": "KG", "name": "Kilogram", "nameEn": "Kilogram" },
    "hsCode": "030617",
    "netWeight": 1.0,
    "grossWeight": 1.05,
    "cbm": 0.045,
    "dimensionL": null,
    "dimensionW": null,
    "dimensionH": null,
    "pcsPerCarton": 12,
    "defaultPurchasePriceVnd": 85000,
    "defaultCurrency": "USD",
    "defaultSalePrice": 4.5,
    "status": "ACTIVE",
    "tags": ["shrimp", "frozen", "seafood"],
    "notes": null,
    "defaultVendor": {
      "id": "uuid-vendor-...",
      "vendorCode": "VND-0001",
      "name": "Công ty TNHH Thủy Sản Miền Nam",
      "contactPhone": "0901234567"
    },
    "marketPrices": [
      {
        "id": "uuid-price-...",
        "marketCode": "US",
        "currency": "USD",
        "incoterms": "CIF",
        "salePrice": 5.2,
        "minOrderQty": 1000,
        "effectiveFrom": "2026-04-01",
        "effectiveTo": null
      }
    ],
    "currentVendorPrices": [
      {
        "vendor": { "vendorCode": "VND-0001", "name": "Công ty TNHH Thủy Sản Miền Nam" },
        "purchasePriceVnd": 85000,
        "leadTimeDays": 5,
        "effectiveFrom": "2026-04-01"
      }
    ],
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-04-01T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 400 | INVALID_UUID | `:id` không phải UUID |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table chính**: `products`
- **JOIN**: `product_categories`, `product_units`, `vendors`, `product_market_prices`, `vendor_price_histories`
- **Service method**: `ProductsService.findOne(id, currentUser)`
