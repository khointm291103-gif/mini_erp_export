# GET /api/v1/products/export

## Mô tả
Xuất danh sách sản phẩm ra file Excel (`.xlsx`). Hỗ trợ lọc tương tự `GET /products`. Dùng để chia sẻ danh mục hàng hóa với buyer hoặc in báo cáo nội bộ.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`, `sales`, `purchasing`.

---

## Request

### Query Params

Hỗ trợ tất cả các filter của `GET /products` (không có `page`/`limit`):

| Param | Type | Mô tả |
|---|---|---|
| `search` | string | Tìm kiếm |
| `categoryId` | UUID | Lọc theo danh mục |
| `status` | enum | Lọc theo trạng thái |
| `hasHsCode` | boolean | Lọc sản phẩm có/không có HS Code |
| `includeInactive` | boolean | Mặc định chỉ export ACTIVE; `true` = bao gồm INACTIVE |
| `lang` | string | `vi` \| `en` — ngôn ngữ header cột, default `vi` |

---

## Business Rules

1. Tối đa 5000 sản phẩm trong một lần export — trả 400 nếu kết quả query > 5000.
2. File Excel có tên: `products-export-YYYY-MM-DD.xlsx`.
3. Cột trong file Excel (theo thứ tự):
   - Mã hàng (Product Code)
   - Tên sản phẩm (Name)
   - Tên tiếng Anh (English Name)
   - Mô tả tiếng Anh (English Description)
   - Danh mục (Category)
   - Đơn vị tính (Unit)
   - HS Code
   - Trọng lượng tịnh (Net Weight kg)
   - Trọng lượng cả bì (Gross Weight kg)
   - CBM
   - Số lượng/thùng (Pcs/Carton)
   - Giá mua VND (chỉ hiện với `admin`, `purchasing`)
   - Giá bán mặc định (Default Sale Price)
   - Tiền tệ (Currency)
   - Trạng thái (Status)
   - Nhà cung cấp mặc định (Default Vendor)
4. Không ghi `defaultPurchasePriceVnd` nếu user có role `sales`.

---

## Response

HTTP `200 OK` với headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="products-export-2026-04-23.xlsx"
```

Response body là binary stream của file Excel.

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 400 | EXPORT_TOO_LARGE | Kết quả > 5000 sản phẩm — yêu cầu lọc hẹp hơn |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Role không được phép |

---

## Entity liên quan

- **Table chính**: `products`
- **JOIN**: `product_categories`, `product_units`, `vendors`
- **Service method**: `ProductsService.exportToExcel(query, currentUser)`

---

## Ghi chú implementation

Dùng thư viện `exceljs` hoặc `xlsx` để tạo file Excel trong memory rồi pipe vào response stream. Không lưu file tạm trên disk.
