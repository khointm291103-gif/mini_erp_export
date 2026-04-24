# PATCH /api/v1/products/:id

## Mô tả
Cập nhật thông tin sản phẩm. Partial update — chỉ cập nhật các field được gửi lên.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `purchasing`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |

### Body (JSON) — tất cả optional

Tương tự `POST /products` nhưng tất cả fields đều optional. Không được thay đổi `productCode` (immutable).

| Field | Type | Mô tả |
|---|---|---|
| `name` | string | Tên tiếng Việt |
| `nameEn` | string | Tên tiếng Anh |
| `descriptionEn` | string | Mô tả tiếng Anh |
| `categoryId` | UUID | Danh mục mới |
| `baseUnitId` | UUID | Đơn vị tính mới |
| `hsCode` | string | HS Code mới |
| `netWeight` | number | Trọng lượng tịnh |
| `grossWeight` | number | Trọng lượng cả bì |
| `cbm` | number | Thể tích thùng |
| `dimensionL/W/H` | number | Kích thước |
| `pcsPerCarton` | integer | Số lượng/thùng |
| `defaultPurchasePriceVnd` | number | Giá mua mặc định |
| `defaultCurrency` | string | Tiền tệ bán hàng mặc định |
| `defaultSalePrice` | number | Giá bán mặc định |
| `defaultVendorId` | UUID \| null | Nhà cung cấp mặc định (null = bỏ gán) |
| `tags` | string[] | Nhãn (replace toàn bộ) |
| `notes` | string | Ghi chú |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc đã soft-delete.
2. `productCode` là immutable — bị ignore nếu gửi lên.
3. `status` không thay đổi qua API này — dùng `PATCH /products/:id/status`.
4. Nếu `categoryId` thay đổi: category mới phải tồn tại và `isActive = true`.
5. Nếu `baseUnitId` thay đổi: unit mới phải tồn tại và `isActive = true`.
6. `grossWeight` >= `netWeight` nếu cả hai có giá trị.

---

## Response (200 OK)

```json
{
  "data": {
    "id": "uuid-product-...",
    "productCode": "PRD-0042",
    "name": "Tôm thẻ chân trắng đông lạnh HOSO 21/25",
    "hsCode": "030617",
    "updatedAt": "2026-04-23T11:00:00.000Z"
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 404 | CATEGORY_NOT_FOUND | `categoryId` không tồn tại hoặc inactive |
| 404 | UNIT_NOT_FOUND | `baseUnitId` không tồn tại hoặc inactive |
| 400 | WEIGHT_INVALID | `grossWeight` < `netWeight` |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |

---

## Entity liên quan

- **Table**: `products`
- **Service method**: `ProductsService.update(id, dto)`
