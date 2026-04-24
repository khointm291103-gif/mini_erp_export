# DELETE /api/v1/products/:id/market-prices/:priceId

## Mô tả
Xóa vĩnh viễn một bản ghi giá bán theo thị trường. Chỉ được phép xóa các bản ghi chưa được dùng trong bất kỳ đơn hàng nào. Ưu tiên dùng `PATCH effectiveTo` thay vì DELETE để giữ lịch sử.

## Authentication
Yêu cầu `Authorization: Bearer <jwt>`. Role được phép: `admin`.

---

## Request

### Path Params

| Param | Type | Mô tả |
|---|---|---|
| `id` | UUID | ID sản phẩm |
| `priceId` | UUID | ID bản ghi giá thị trường |

---

## Business Rules

1. Trả 404 nếu sản phẩm không tồn tại hoặc `priceId` không thuộc sản phẩm này.
2. Cho phép hard-delete bản ghi giá vì đây không phải document giao dịch — chỉ là master data giá tham khảo.
3. Khi module Sales được implement: kiểm tra bản ghi này có được tham chiếu trong SO không — nếu có thì chặn.

---

## Response (200 OK)

```json
{
  "data": {
    "message": "Bản ghi giá thị trường đã được xóa."
  }
}
```

---

## Response (Error Cases)

| HTTP | Code | Trường hợp |
|---|---|---|
| 404 | PRODUCT_NOT_FOUND | Sản phẩm không tồn tại hoặc đã xóa |
| 404 | MARKET_PRICE_NOT_FOUND | priceId không tồn tại hoặc không thuộc sản phẩm |
| 409 | PRICE_IN_USE | Bản ghi giá đã được dùng trong đơn hàng (kiểm tra khi Sales module có) |
| 401 | UNAUTHORIZED | JWT thiếu hoặc hết hạn |
| 403 | FORBIDDEN | Chỉ admin |

---

## Entity liên quan

- **Table**: `product_market_prices`
- **Service method**: `ProductsService.deleteMarketPrice(productId, priceId)`
