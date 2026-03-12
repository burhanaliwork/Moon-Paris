# Workspace - مون باريس (Moon Paris)

## Overview

متجر عطور عراقي فاخر باللغة العربية. موقع RTL كامل مع نظام مصادقة، لوحة أدمن، وإدارة المنتجات والطلبات.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Zustand

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/      # Express API server (port 8080)
│   └── moon-paris/      # React frontend (port 24728)
├── lib/
│   ├── api-spec/        # OpenAPI spec + Orval codegen config
│   ├── api-client-react/# Generated React Query hooks
│   ├── api-zod/         # Generated Zod schemas from OpenAPI
│   └── db/              # Drizzle ORM schema + DB connection
```

## Owner / Admin Account

- **Email**: owner@moonparis.iq
- **Password**: MoonParis@Owner2024
- **Role**: admin
- **Admin Panel**: /admin

## Database Tables

- `users` - المستخدمين (role: user | admin)
- `products` - المنتجات (عطور)
- `orders` + `order_items` - الطلبات
- `otp_codes` - رموز التحقق عبر الواتساب
- `site_settings` - إعدادات الموقع
- `promotions` - العروض والإعلانات

## Key Features

### Frontend Pages
- `/welcome` - صفحة تسجيل الدخول (3 خيارات)
- `/` - الصفحة الرئيسية للمتجر
- `/product/:id` - صفحة المنتج
- `/cart` - السلة والدفع
- `/admin` - لوحة التحكم (أدمن)
- `/admin/products` - إدارة المنتجات
- `/admin/orders` - إدارة الطلبات
- `/admin/promotions` - العروض والإعلانات + تخفيض بالجملة
- `/admin/users` - إدارة المستخدمين
- `/admin/settings` - إعدادات الموقع

### Auth Flow
- تسجيل بدون حساب (guest) - يطلب البيانات عند الطلب
- إنشاء حساب + تحقق واتساب (OTP)
- تسجيل دخول بالرقم+OTP أو إيميل+باسورد

### Iraqi Governorates
Dropdown with all 18 Iraqi governorates

## WhatsApp OTP Setup (Optional)
Set environment variables:
- `WHATSAPP_API_URL` - WhatsApp Business API endpoint
- `WHATSAPP_TOKEN` - API Token
In development, OTP is printed to server console logs.
