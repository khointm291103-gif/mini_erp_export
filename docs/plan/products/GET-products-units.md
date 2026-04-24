# GET /api/v1/products/units

## Mô tả
Lấy danh sách tất cả đơn vị tính. Thường dùng để populate dropdown khi tạo/sửa sản phẩm.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: tất cả roles đã đăng nhập.

---

## Request

### Query Params

| Param | Type | Mặc định | Mô tả |
|---|---|---|---|
| `activeOnly` | boolean | true | Chỉ lấy đơn vị đang active |
| `search` | string | — | Tìm theo `code` hoặc `name` |

---

## Response (200 OK)

```json
{
  "data": [
    { "id": "uuid-...", "code": "CTN", "name": "Thùng carton", "nameEn": "Carton", "isActive": true },
    { "id": "uuid-...", "code": "KG",  "name": "Kilogram",     "nameEn": "Kilogram", "isActive": true },
    { "id": "uuid-...", "code": "MT",  "name": "Tấn",          "nameEn": "Metric Ton", "isActive": true },
    { "id": "uuid-...", "code": "PCS", "name": "Cái",          "nameEn": "Piece", "isActive": true }
  ]
}
```

---

## Entity liên quan

- **Table**: `product_units`
- **Service method**: `ProductsService.getUnits(query)`

---

## Ghi chú

Không phân trang — danh sách đơn vị thường rất nhỏ (< 30 bản ghi). Trả toàn bộ danh sách.
