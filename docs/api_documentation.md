# ShopMart API Documentation (Mock Catalog and Local Operations)

This document provides specifications for the REST endpoints used by the ShopMart application. The project functions as a client-side single page application, pulling catalogs from DummyJSON and maintaining mutations (Cart, Orders, Reviews, and Profiles) inside a persisted state engine.

---

## 1. Product Catalog Endpoints (DummyJSON Integration)

### GET /products
Retrieves base products catalog.
- **URL**: `https://dummyjson.com/products?limit=100`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "products": [
      {
        "id": 1,
        "title": "Essence Mascara Lash Princess",
        "description": "The Essence Mascara Lash Princess...",
        "price": 9.99,
        "discountPercentage": 7.17,
        "rating": 4.94,
        "stock": 5,
        "brand": "Essence",
        "category": "beauty",
        "thumbnail": "..."
      }
    ],
    "total": 100,
    "skip": 0,
    "limit": 100
  }
  ```

### GET /products/:id
Retrieves detailed information for a single product.
- **URL**: `https://dummyjson.com/products/:id`
- **Method**: `GET`

### GET /products/search
Search through catalog items.
- **URL**: `https://dummyjson.com/products/search?q=:query`
- **Method**: `GET`

---

## 2. Placed Order Model

Orders created during checkout are logged locally. Below is the JSON schema structure:

```json
{
  "id": "ord-8291037",
  "items": [
    {
      "product": {
        "id": 1,
        "title": "Essence Mascara Lash Princess",
        "price": 9.27,
        "thumbnail": "https://..."
      },
      "quantity": 2,
      "selectedColor": "Black"
    }
  ],
  "shippingAddress": {
    "id": "addr-1",
    "name": "John Doe",
    "street": "123 Main Street, Apt 4B",
    "city": "Seattle",
    "state": "WA",
    "zipCode": "98101",
    "country": "United States",
    "phone": "+1 206-555-0199"
  },
  "paymentMethod": "stripe",
  "paymentDetails": {
    "cardBrand": "Visa",
    "last4": "4242",
    "transactionId": "tx_g82hka9"
  },
  "subtotal": 18.54,
  "shippingCost": 0,
  "tax": 1.48,
  "discount": 0,
  "total": 20.02,
  "status": "pending",
  "createdAt": "2026-06-18T18:00:00.000Z",
  "deliveryDate": "2026-06-21T18:00:00.000Z",
  "trackingNumber": "1Z999AA10123456784"
}
```

---

## 3. Sandboxed Coupon Rules

The application processes two discount codes at checkout:

1. **SHOPMART20**
   - **Type**: Percentage deduction
   - **Value**: 20%
   - **Applicable**: All items

2. **SAVE10**
   - **Type**: Flat reduction
   - **Value**: $10.00
   - **Applicable**: Subtotal must be greater than $10.00
