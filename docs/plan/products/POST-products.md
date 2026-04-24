# POST /api/v1/products

## Mô tả
Tạo mới một sản phẩm trong danh mục hàng hóa xuất khẩu. `productCode` tự sinh nếu không cung cấp.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Body (JSON)

| Field | Type | Bắt buộc | Mô tả |
|---|---|---|---|
| `name` | string | ✅ | Tên sản phẩm tiếng Việt, max 200 |
| `nameEn` | string | ❌ | Tên tiếng Anh — dùng trong Commercial Invoice, Packing List |
| `descriptionEn` | string | ❌ | Mô tả hàng hóa tiếng Anh cho hồ sơ xuất khẩu |
| `categoryId` | UUID | ✅ | ID danh mục |
| `baseUnitId` | UUID | ✅ | ID đơn vị tính cơ bản |
| `productCode` | string | ❌ | Mã sản phẩm, auto-gen `PRD-XXXX` nếu không cung cấp |
| `hsCode` | string | ❌ | Mã HS Code 6–10 chữ số (dùng cho khai báo hải quan) |
| `netWeight` | number | ❌ | Trọng lượng tịnh (kg) per base unit, >= 0 |
| `grossWeight` | number | ❌ | Trọng lượng cả bì (kg) per base unit, >= 0 |
| `cbm` | number | ❌ | Thể tích thùng (m³) per packaging unit, >= 0 |
| `dimensionL` | number | ❌ | Chiều dài (cm) |
| `dimensionW` | number | ❌ | Chiều rộng (cm) |
| `dimensionH` | number | ❌ | Chiều cao (cm) |
| `pcsPerCarton` | integer | ❌ | Số lượng / thùng carton, >= 1 |
| `defaultPurchasePriceVnd` | number | ❌ | Giá mua VND mặc định, >= 0 |
| `defaultCurrency` | string | ❌ | Tiền tệ bán hàng mặc định (3 ký tự), default `USD` |
| `defaultSalePrice` | number | ❌ | Giá bán mặc định theo `defaultCurrency`, >= 0 |
| `defaultVendorId` | UUID | ❌ | ID nhà cung cấp mặc định |
| `tags` | string[] | ❌ | Nhãn tìm kiếm nhanh |
| `notes` | string | ❌ | Ghi chú nội bộ |

**Ví dụ:**
```json
{
  "name": "Tôm thẻ chân trắng đông lạnh HOSO",
  "nameEn": "Frozen Vannamei Shrimp HOSO",
  "descriptionEn": "Frozen white leg shrimp, head-on shell-on, IQF, size 21/25",
  "categoryId": "uuid-cat-dong-lanh",
  "baseUnitId": "uuid-unit-kg",
  "hsCode": "030617",
  "netWeight": 1.0,
  "grossWeight": 1.05,
  "cbm": 0.045,
  "pcsPerCarton": 12,
  "defaultPurchasePriceVnd": 85000,
  "defaultCurrency": "USD",
  "defaultSalePrice": 4.5,
  "defaultVendorId": "uuid-vendor-...",
  "tags": ["shrimp", "frozen", "seafood", "vannamei"]
}
```

---

## Business Rules

1. `productCode` phải unique — trả 409 nếu trùng.
2. Auto-gen `productCode` format `PRD-XXXX` (4 chữ số) nếu không cung cấp.
3. `categoryId` phải tồn tại và `isActive = true`.
4. `baseUnitId` phải tồn tại và `isActive = true`.
5. Nếu `defaultVendorId` được cung cấp, phải tồn tại và không bị soft-delete.
6. `grossWeight` phải >= `netWeight` nếu cả hai được cung cấp.
7. `status` mặc định `ACTIVE`.
8. `defaultCurrency` phải là mã tiền tệ ISO 4217 hợp lệ (uppercase 3 ký tự).

---

## Response (201 Created)

```json
{
  "data": {
    "id": "uuid-product-...",
    "productCode": "PRD-0042",
    "name": "Tôm thẻ chân trắng đông lạnh HOSO",
    "nameEn": "Frozen Vannamei Shrimp HOSO",
    "categoryId": "uuid-cat-dong-lanh",
    "baseUnit": { "id": "uuid-unit-kg", "code": "KG", "name": "Kilogram" },
    "hsCode": "030617",
    "netWeight": 1.0,
    "grossWeight": 1.05,
    "cbm": 0.045,
    "pcsPerCarton": 12,
    "defaultPurchasePriceVnd": 85000,
    "defaultCurrency": "USD",
    "defaultSalePrice": 4.5,
    "status": "ACTIVE",
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 409 | PRODUCT_CODE_EXISTS | `productCode` đã tồn tại |
| 404 | CATEGORY_NOT_FOUND | `categoryId` không tồn tại hoặc inactive |
| 404 | UNIT_NOT_FOUND | `baseUnitId` không tồn tại hoặc inactive |
| 404 | VENDOR_NOT_FOUND | `defaultVendorId` không tồn tại hoặc đã xóa |
| 400 | WEIGHT_INVALID | `grossWeight` < `netWeight` |
| 400 | VALIDATION_ERROR | Sai định dạng field |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `products`
- **Service method**: `ProductsService.create(dto, currentUser)`
