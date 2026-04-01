# Project Overview

## Introduction

The **Inventory Management System (SGE - Sistema de Gestão de Estoque)** is a comprehensive web application built with Django for managing inventory, products, suppliers, brands, and categories. It provides both a user-friendly web interface and a RESTful API for programmatic access.

## Purpose

SGE was designed to help businesses of all sizes efficiently manage their inventory operations, including:

- **Stock Tracking** - Real-time monitoring of product quantities
- **Purchase Management** - Record and track product inflows from suppliers
- **Sales Management** - Track product outflows and sales
- **Financial Control** - Monitor cost prices, selling prices, and profit margins
- **Analytics** - Visual dashboards with key performance indicators
- **AI-Powered Insights** - Automated recommendations for stock replenishment

## Key Features

### 📦 Product Management
- Complete CRUD operations for products
- Track cost price, selling price, and quantity
- Associate products with brands and categories
- Serial number tracking (optional)

### 🔄 Stock Control
- **Inflows** - Register product entries from suppliers
- **Outflows** - Register product sales/outputs
- Automatic quantity updates on stock movements
- Stock history tracking

### 🏢 Supplier Management
- Maintain supplier information
- Link suppliers to product inflows
- Track supplier relationships

### 🏷️ Brands & Categories
- Organize products by brand
- Categorize products for better organization
- Hierarchical product organization

### 📊 Dashboard & Analytics
- Real-time metrics and KPIs
- Sales charts (daily, weekly)
- Product distribution by category and brand
- Profit calculations
- Total inventory value

### 🤖 AI Integration
- OpenAI GPT-3.5-turbo integration
- Automated stock analysis
- Replenishment recommendations
- Sales trend insights

### 🔐 Authentication & Authorization
- Django authentication for web interface
- JWT authentication for API
- Role-based access control
- Granular permissions per model

### 🔗 External Integrations
- Webhook support for outflow events
- RESTful API for third-party integration
- HTTPX client for external services

## User Interface

### Web Interface
- **Django Templates** - Server-side rendered pages
- **TailwindCSS** - Modern, responsive design
- **Chart.js** - Interactive charts and graphs
- **Dark Theme** - Professional purple/blue gradient design
- **Responsive** - Mobile-first design

### API Interface
- **RESTful Design** - Standard HTTP methods
- **JSON Format** - Easy integration
- **JWT Authentication** - Secure token-based auth
- **Pagination** - Efficient data retrieval
- **Filtering** - Advanced query capabilities

## System Capabilities

### Multi-User Support
- User authentication and session management
- Permission-based access control
- Admin interface for user management

### Real-Time Updates
- Automatic stock quantity updates
- Signal-based event handling
- Real-time dashboard metrics

### Data Integrity
- Foreign key constraints (PROTECT)
- Transaction safety
- Data validation at model level

### Scalability
- PostgreSQL support for production
- Docker containerization
- Horizontal scaling ready

## Business Value

| Benefit | Description |
|---------|-------------|
| **Efficiency** | Automate manual inventory tracking |
| **Accuracy** | Reduce human errors in stock counting |
| **Visibility** | Real-time insights into inventory status |
| **Control** | Track all stock movements |
| **Profitability** | Monitor margins and optimize pricing |
| **Integration** | Connect with external systems via API |

## Target Audience

- Small to medium businesses
- Retail stores
- Warehouses
- Distribution centers
- E-commerce operations
- Manufacturing facilities

## Use Cases

### Retail Store
Track products, manage supplier relationships, monitor sales, and get AI recommendations for restocking.

### Warehouse
Manage large inventories, track inflows/outflows, and maintain accurate stock levels.

### E-commerce
Integrate via API with online stores, automate stock updates, and track sales across channels.

### Distribution
Manage multiple suppliers, track product movements, and analyze sales patterns.

## Technology Highlights

- **Modern Stack** - Django 5.0.1, Python 3.11
- **REST API** - Full-featured API with DRF
- **Security** - JWT tokens, permission-based access
- **AI-Powered** - OpenAI integration for insights
- **Containerized** - Docker-ready for easy deployment
- **Responsive** - Works on desktop, tablet, and mobile

## Future Roadmap

- [ ] Multi-warehouse support
- [ ] Barcode/QR code scanning
- [ ] Advanced reporting
- [ ] Mobile application
- [ ] Email notifications
- [ ] Export to Excel/PDF
- [ ] Multi-currency support
- [ ] Advanced AI predictions

---

**Next Steps**: 
- [Prerequisites](prerequisites.md) - Check system requirements
- [Installation](installation.md) - Install and set up the project
