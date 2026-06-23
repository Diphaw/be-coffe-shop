# Coffee Shop CMS - Backend API Server

Backend API server untuk aplikasi Coffee Shop CMS, dibangun dengan **Express**, **TypeScript**, dan **Prisma ORM**.

## 🚀 Fitur Utama
*   **Authentication & Role Authorization**: Pengamanan akses API menggunakan JWT (JSON Web Token).
*   **Order Flow Management**: Pengolahan transaksi pesanan Dine-In dan Takeaway.
*   **Inventory & Menu Management**: API CRUD untuk produk menu dan stok.
*   **Real-time Push Notifications**: Integrasi Pusher untuk notifikasi live ke kasir dan dapur.

## 🛠️ Tech Stack
*   Node.js & Express
*   TypeScript
*   Prisma ORM & PostgreSQL
*   Pusher Server SDK
*   Zod Validation

## ⚙️ Cara Menjalankan Project

1.  **Instalasi Dependensi**:
    ```bash
    npm install
    ```
2.  **Migrasi Database**:
    ```bash
    npm run db:migrate
    npm run db:generate
    ```
3.  **Menjalankan Mode Pengembangan**:
    ```bash
    npm run dev
    ```
