# 🩺 JRG Medical Agencies

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

A comprehensive B2B web portal designed to digitize the pharmaceutical distribution supply chain between the **Jangareddygudem Medical Agencies** and their network of registered retailer pharmacies. 

## 📋 Overview
Currently, medical distribution relies heavily on phone calls, handwritten records, and manual billing. This project digitizes the entire workflow, providing:
1. An **Owner Command Center** for inventory, order fulfillment, and ledger tracking.
2. A **Retailer Digital Storefront** for real-time catalog browsing and instant ordering.

---

## ✨ Features

### For the Agency Owner:
- **Dashboard Hub:** High-level metrics for pending orders and outstanding credit.
- **Catalog Management:** Full CRUD (Create, Read, Update, Delete) access for brands and medicines.
- **Order Fulfillment:** Approve, confirm, and dispatch retailer orders.
- **Automated GST Invoicing:** Generates downloadable, print-ready invoices with automated CGST/SGST calculations.
- **Ledger System:** Tracks manual retailer payments and running balances.

### For the Retailer:
- **Digital Storefront:** Search and filter medicines by brand, category, and active promotional schemes (e.g., 10+2 free).
- **Smart Cart System:** Real-time mathematics for bulk pricing and discounts.
- **API-less WhatsApp Checkout:** Seamlessly places orders by routing formatted cart data directly to the agency's WhatsApp via a custom URL schema.
- **Order Tracking:** Real-time visibility on order status (`Processing`, `Confirmed`, `Delivered`).

---

## 🛠️ Technology Stack
* **Frontend:** React.js 19
* **Build Tool:** Vite
* **Styling:** Tailwind CSS v4 (Custom Medical Teal Theme)
* **Routing:** React Router v7
* **State Management:** React Context API (AuthContext, ProductContext)
* **Icons & Animation:** Lucide React, Framer Motion
* **Database & Auth:** Supabase (PostgreSQL)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/jrg-medical-agencies.git
   cd jrg-medical-agencies
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase connection strings:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

---

## 🎨 UI/UX Highlights
The application abandons generic frontend templates in favor of a custom, high-contrast **"Medical Teal" and Slate** Light Theme. It focuses heavily on data density, ensuring large catalogs and tables are readable on both desktop and mobile viewports.
