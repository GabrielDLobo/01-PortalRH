# API Endpoints

Complete reference for the Inventory Management System REST API.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Brands](#brands)
4. [Categories](#categories)
5. [Suppliers](#suppliers)
6. [Products](#products)
7. [Inflows](#inflows)
8. [Outflows](#outflows)
9. [Error Handling](#error-handling)
10. [Pagination](#pagination)

---

## API Overview

### Base URL

```
Development: http://localhost:8000/api/v1/
Production: https://yourdomain.com/api/v1/
```

### Content Type

All requests and responses use JSON format:

```
Content-Type: application/json
```

### HTTP Methods

| Method | Description |
|--------|-------------|
| `GET` | Retrieve resource(s) |
| `POST` | Create new resource |
| `PUT` | Update entire resource |
| `PATCH` | Partial update |
| `DELETE` | Delete resource |

---

## Authentication

### Obtain JWT Token

**Endpoint:** `POST /api/v1/authentication/token/`

**Request:**
```json
{
  "username": "admin",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Usage:**
Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

### Refresh Token

**Endpoint:** `POST /api/v1/authentication/token/refresh/`

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### Verify Token

**Endpoint:** `POST /api/v1/authentication/token/verify/`

**Request:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```
200 OK (if valid)
401 Unauthorized (if invalid)
```

---

## Brands

### List Brands

**Endpoint:** `GET /api/v1/brands/`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `search` | string | - | Search by name |
| `ordering` | string | `name` | Field to order by |

**Response:**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/v1/brands/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Samsung",
      "description": "Electronics brand",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Create Brand

**Endpoint:** `POST /api/v1/brands/`

**Request:**
```json
{
  "name": "LG",
  "description": "Korean electronics manufacturer"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "LG",
  "description": "Korean electronics manufacturer",
  "created_at": "2024-01-16T14:20:00Z",
  "updated_at": "2024-01-16T14:20:00Z"
}
```

---

### Get Brand

**Endpoint:** `GET /api/v1/brands/<id>/`

**Response:**
```json
{
  "id": 1,
  "name": "Samsung",
  "description": "Electronics brand",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### Update Brand

**Endpoint:** `PUT /api/v1/brands/<id>/` or `PATCH /api/v1/brands/<id>/`

**Request:**
```json
{
  "name": "Samsung Electronics",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Samsung Electronics",
  "description": "Updated description",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T15:00:00Z"
}
```

---

### Delete Brand

**Endpoint:** `DELETE /api/v1/brands/<id>/`

**Response:**
```
204 No Content
```

---

## Categories

### List Categories

**Endpoint:** `GET /api/v1/categories/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `search` | string | Search by name |

**Response:**
```json
{
  "count": 30,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-10T08:00:00Z"
    }
  ]
}
```

---

### Create Category

**Endpoint:** `POST /api/v1/categories/`

**Request:**
```json
{
  "name": "Home Appliances",
  "description": "Household appliances"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Home Appliances",
  "description": "Household appliances",
  "created_at": "2024-01-16T14:30:00Z",
  "updated_at": "2024-01-16T14:30:00Z"
}
```

---

### Get Category

**Endpoint:** `GET /api/v1/categories/<id>/`

**Response:**
```json
{
  "id": 1,
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "created_at": "2024-01-10T08:00:00Z",
  "updated_at": "2024-01-10T08:00:00Z"
}
```

---

### Update Category

**Endpoint:** `PUT /api/v1/categories/<id>/` or `PATCH /api/v1/categories/<id>/`

**Request:**
```json
{
  "name": "Consumer Electronics",
  "description": "Updated description"
}
```

---

### Delete Category

**Endpoint:** `DELETE /api/v1/categories/<id>/`

**Response:**
```
204 No Content
```

---

## Suppliers

### List Suppliers

**Endpoint:** `GET /api/v1/suppliers/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `search` | string | Search by name |

**Response:**
```json
{
  "count": 25,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Tech Distributors Inc.",
      "description": "Main electronics distributor",
      "created_at": "2024-01-05T09:00:00Z",
      "updated_at": "2024-01-05T09:00:00Z"
    }
  ]
}
```

---

### Create Supplier

**Endpoint:** `POST /api/v1/suppliers/`

**Request:**
```json
{
  "name": "Global Supplies Ltd.",
  "description": "International supplier"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Global Supplies Ltd.",
  "description": "International supplier",
  "created_at": "2024-01-16T14:45:00Z",
  "updated_at": "2024-01-16T14:45:00Z"
}
```

---

### Get Supplier

**Endpoint:** `GET /api/v1/suppliers/<id>/`

---

### Update Supplier

**Endpoint:** `PUT /api/v1/suppliers/<id>/` or `PATCH /api/v1/suppliers/<id>/`

---

### Delete Supplier

**Endpoint:** `DELETE /api/v1/suppliers/<id>/`

---

## Products

### List Products

**Endpoint:** `GET /api/v1/products/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `search` | string | Search by title |
| `category` | int | Filter by category ID |
| `brand` | int | Filter by brand ID |
| `min_price` | decimal | Minimum price filter |
| `max_price` | decimal | Maximum price filter |
| `ordering` | string | Ordering field |

**Response:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Samsung Galaxy S23",
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "brand": {
        "id": 1,
        "name": "Samsung"
      },
      "description": "Latest flagship smartphone",
      "serie_number": "SN123456789",
      "cost_price": "500.00",
      "selling_price": "799.99",
      "quantity": 50,
      "created_at": "2024-01-10T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

---

### Create Product

**Endpoint:** `POST /api/v1/products/`

**Request:**
```json
{
  "title": "iPhone 15 Pro",
  "category": 1,
  "brand": 2,
  "description": "Apple flagship phone",
  "cost_price": "899.00",
  "selling_price": "1199.00",
  "quantity": 30
}
```

**Response:**
```json
{
  "id": 2,
  "title": "iPhone 15 Pro",
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "brand": {
    "id": 2,
    "name": "Apple"
  },
  "description": "Apple flagship phone",
  "serie_number": null,
  "cost_price": "899.00",
  "selling_price": "1199.00",
  "quantity": 30,
  "created_at": "2024-01-16T15:00:00Z",
  "updated_at": "2024-01-16T15:00:00Z"
}
```

---

### Get Product

**Endpoint:** `GET /api/v1/products/<id>/`

**Response:**
```json
{
  "id": 1,
  "title": "Samsung Galaxy S23",
  "category": {
    "id": 1,
    "name": "Electronics"
  },
  "brand": {
    "id": 1,
    "name": "Samsung"
  },
  "description": "Latest flagship smartphone",
  "serie_number": "SN123456789",
  "cost_price": "500.00",
  "selling_price": "799.99",
  "quantity": 50,
  "created_at": "2024-01-10T10:00:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

---

### Update Product

**Endpoint:** `PUT /api/v1/products/<id>/` or `PATCH /api/v1/products/<id>/`

**Request:**
```json
{
  "title": "Samsung Galaxy S23 Ultra",
  "selling_price": "899.99",
  "quantity": 45
}
```

---

### Delete Product

**Endpoint:** `DELETE /api/v1/products/<id>/`

**Note:** Fails if product has related inflows/outflows (PROTECT constraint).

---

## Inflows

### List Inflows

**Endpoint:** `GET /api/v1/inflows/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `supplier` | int | Filter by supplier ID |
| `product` | int | Filter by product ID |
| `date_from` | date | Start date filter |
| `date_to` | date | End date filter |

**Response:**
```json
{
  "count": 100,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "supplier": {
        "id": 1,
        "name": "Tech Distributors Inc."
      },
      "product": {
        "id": 1,
        "title": "Samsung Galaxy S23"
      },
      "quantity": 20,
      "description": "Monthly restock",
      "created_at": "2024-01-15T09:00:00Z",
      "updated_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### Create Inflow

**Endpoint:** `POST /api/v1/inflows/`

**Request:**
```json
{
  "supplier": 1,
  "product": 1,
  "quantity": 50,
  "description": "Emergency restock"
}
```

**Response:**
```json
{
  "id": 2,
  "supplier": {
    "id": 1,
    "name": "Tech Distributors Inc."
  },
  "product": {
    "id": 1,
    "title": "Samsung Galaxy S23"
  },
  "quantity": 50,
  "description": "Emergency restock",
  "created_at": "2024-01-16T10:00:00Z",
  "updated_at": "2024-01-16T10:00:00Z"
}
```

**Note:** Creating an inflow automatically updates the product quantity.

---

### Get Inflow

**Endpoint:** `GET /api/v1/inflows/<id>/`

---

### Delete Inflow

**Endpoint:** `DELETE /api/v1/inflows/<id>/`

**Note:** Inflows cannot be updated (immutable record). Delete and create new if needed.

---

## Outflows

### List Outflows

**Endpoint:** `GET /api/v1/outflows/`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `product` | int | Filter by product ID |
| `date_from` | date | Start date filter |
| `date_to` | date | End date filter |

**Response:**
```json
{
  "count": 200,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "title": "Samsung Galaxy S23"
      },
      "quantity": 5,
      "description": "Sale to customer #1234",
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

---

### Create Outflow

**Endpoint:** `POST /api/v1/outflows/`

**Request:**
```json
{
  "product": 1,
  "quantity": 10,
  "description": "Bulk sale"
}
```

**Response:**
```json
{
  "id": 2,
  "product": {
    "id": 1,
    "title": "Samsung Galaxy S23"
  },
  "quantity": 10,
  "description": "Bulk sale",
  "created_at": "2024-01-16T11:00:00Z",
  "updated_at": "2024-01-16T11:00:00Z"
}
```

**Note:** 
- Creating an outflow automatically decreases product quantity
- Triggers webhook notification if enabled
- Fails if quantity exceeds available stock

---

### Get Outflow

**Endpoint:** `GET /api/v1/outflows/<id>/`

---

### Delete Outflow

**Endpoint:** `DELETE /api/v1/outflows/<id>/`

**Note:** Outflows cannot be updated (immutable record).

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `201` | Created |
| `204` | No Content |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `405` | Method Not Allowed |
| `422` | Validation Error |
| `500` | Server Error |

### Error Examples

**401 Unauthorized:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found:**
```json
{
  "detail": "Not found."
}
```

**422 Validation Error:**
```json
{
  "title": [
    "This field is required."
  ],
  "selling_price": [
    "Ensure that there are no more than 20 digits before the decimal point."
  ]
}
```

---

## Pagination

### Default Pagination

All list endpoints return paginated responses:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/products/?page=2",
  "previous": null,
  "results": [...]
}
```

### Pagination Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | 1 | Page number |
| `page_size` | 10 | Items per page (if configured) |

### Navigation

```bash
# First page
GET /api/v1/products/

# Second page
GET /api/v1/products/?page=2

# With custom page size
GET /api/v1/products/?page=2&page_size=25
```

---

## Rate Limiting

API rate limiting may be configured. Typical limits:

| Endpoint Type | Limit |
|---------------|-------|
| Authentication | 10 requests/minute |
| Read (GET) | 100 requests/minute |
| Write (POST/PUT/DELETE) | 50 requests/minute |

---

## cURL Examples

### Authenticate
```bash
curl -X POST http://localhost:8000/api/v1/authentication/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### List Products
```bash
curl -X GET http://localhost:8000/api/v1/products/ \
  -H "Authorization: Bearer <token>"
```

### Create Product
```bash
curl -X POST http://localhost:8000/api/v1/products/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Product",
    "category": 1,
    "brand": 1,
    "cost_price": "10.00",
    "selling_price": "20.00",
    "quantity": 100
  }'
```

---

**Next Steps**: 
- [System Modeling](system-modeling.md) - Architecture diagrams
- [Authentication & Security](authentication-security.md) - Security details
