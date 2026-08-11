# 🍽️ Kahe One

### One Campus. One Platform. A Smarter College Experience.

**Kahe One** is a modular campus platform designed to bring essential college services into one application.

The current build focuses on **Canteen Pre-order + Secure QR Pickup**, with additional prototype modules for **Announcements, Bus Tracking, and Student Status**.

---

## 🎯 The Problem

College breaks can be very short—sometimes only around **20 minutes**.

When many students reach the canteen at the same time, long queues form:

```text
Short Break
    ↓
Students rush to the canteen
    ↓
Long queue
    ↓
Ordering + Payment
    ↓
Waiting for food
    ↓
Break almost over
```

Students lose valuable break time simply waiting to order and collect their food.

---

## 💡 Our Solution

**Kahe One Canteen** allows students to pre-order their food and collect it from a dedicated pickup point.

### Student Flow

```text
📱 Browse Menu
      ↓
🛒 Add to Cart
      ↓
💳 Checkout
      ↓
🎟️ Receive QR Pickup Pass
      ↓
🏪 Pickup Counter
      ↓
✅ Order Collected
```

Instead of spending the entire break standing in a queue, students can order ahead and use a dedicated pickup process.

---

# ✨ Features

## 🍔 Canteen Pre-order

Students can:

- View the available menu
- Add food items to their cart
- Review quantities and prices
- Place an order
- Track their order status

## 💳 UPI Payment

Students can complete their order using **UPI-based payment**, with support for commonly used UPI apps such as:

* Google Pay
* PhonePe
* FamPay
* Other compatible UPI applications

After successful payment, the order is confirmed and the student receives their QR pickup pass.

> Payment functionality is currently implemented for the hackathon prototype and can be connected to a production UPI payment gateway as the platform scales.

## 🎟️ Secure QR Pickup

After an order is placed, the student receives a QR pickup pass.

Authorized staff can scan the QR code to verify the order and complete the pickup.

The system is designed to prevent forged and reused pickup passes.

## 📢 Announcements

A centralized module for displaying important campus announcements.

## 🚌 Bus Tracking

A prototype bus-tracking module with simulated live ETA data.

## 🎓 Student Status

A prototype student-services module displaying:

- Attendance
- Fee status
- Library status

---

# 🔐 Secure QR Pickup

Security is an important part of the canteen system.

A basic QR pickup system could simply encode an order number:

```text
ORDER-45
```

This can create problems because order IDs may be predictable, copied, or reused.

Kahe One instead uses a **signed JWT-based QR token**.

### Security Layers

#### 🔏 Signed Token

The QR contains a digitally signed token rather than simply exposing the order ID.

Without the server's signing secret, the token cannot be legitimately modified or forged.

#### ⏰ Token Expiration

QR tokens have a limited lifetime.

The current implementation uses a **40-minute expiration period**.

Expired tokens are rejected by the server.

#### 🆔 Unique Token ID

Each QR token contains a unique **`jti`**** (JWT ID)**.

The ID is stored server-side and associated with the order.

#### ♻️ Replay Protection

Once a QR code has successfully been redeemed, the order is marked as picked up.

A second scan of the same QR is rejected.

```text
First Scan
    ↓
Token Valid ✅
    ↓
Order Verified
    ↓
Order → Picked Up
    ↓
Same QR Scanned Again
    ↓
Rejected ❌
```

#### 👮 Role-Based Verification

The QR verification endpoint is restricted to **Staff and Admin roles**.

Students cannot directly use the pickup verification endpoint.

#### 🔑 Password Security

Passwords are hashed using **bcrypt** and are not stored as plain text.

#### 🛡️ Authentication

JWT authentication is shared across the application's modules with role-based authorization checks.

---

# 🎬 Hackathon Demo

The easiest way to demonstrate the main feature is with two browser sessions.

### 1. Student

Log in using the Student account.

```text
Login
  ↓
Canteen
  ↓
Choose food
  ↓
Add to cart
  ↓
Place order
  ↓
Pay
  ↓
QR generated
```

### 2. Staff

Open a second browser window or tab.

```text
Staff Login
    ↓
Staff Tools
    ↓
Pickup Scanner
    ↓
Scan Student QR
    ↓
Order Verified
    ↓
Order → Picked Up ✅
```

The student's order status updates after the pickup is confirmed.

---

# 👤 Demo Accounts

The following accounts are **automatically seeded on the first run**.

| Role        | Email                 | Password      |
| ----------- | --------------------- | ------------- |
| 🎓 Student  | `student@college.edu` | `password123` |
| 👨‍🍳 Staff | `staff@college.edu`   | `password123` |
| 🛠️ Admin   | `admin@college.edu`   | `password123` |

> ⚠️ These are demonstration credentials only. Do not use these credentials for a production deployment.

---

# 🚀 Quick Start

## Requirements

- Node.js
- npm

SQLite requires no separate database server installation.

## 1. Install dependencies

```bash
npm install
```

## 2. Start the server

```bash
npm start
```

The server runs at:

```text
http://localhost:3000
```

## 3. Open Kahe One

Open the address above in your browser.

The database and demo accounts are seeded automatically on the first run.

---

# 🛠️ Technology Stack

| Component        | Technology              |
| ---------------- | ----------------------- |
| Frontend         | HTML5, CSS3, JavaScript |
| Backend          | Node.js + Express       |
| Database         | SQLite                  |
| Database Driver  | better-sqlite3          |
| Authentication   | JWT                     |
| Password Hashing | bcrypt                  |
| QR Generation    | qrcode                  |
| QR Scanning      | html5-qrcode            |
| Architecture     | Modular campus platform |

The frontend uses plain HTML/CSS/JavaScript, so there is **no frontend build step**.

---

# 🏗️ Project Structure

```text
kahe/
│
├── server/
│   ├── index.js
│   ├── db.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   └── routes/
│       ├── auth.js
│       ├── canteen.js
│       ├── announcements.js
│       ├── bus.js
│       └── student.js
│
└── public/
    ├── login.html
    ├── index.html
    │
    ├── shared/
    │   ├── auth.js
    │   └── style.css
    │
    ├── canteen/
    │   ├── menu.html
    │   ├── checkout.html
    │   └── scanner.html
    │
    ├── announcements/
    ├── bus/
    └── student/
```

---

# 🧪 Prototype Components

Some parts of Kahe One are currently simulated for the hackathon.

### 💳 Payment

The current payment flow uses a simulated successful payment.

A production implementation could connect to a real payment provider such as **Razorpay or Stripe**, using the provider's test/production APIs.

A production payment system should also implement appropriate:

- Webhook signature verification
- Idempotency protection
- Transaction verification
- Refund handling

### 🚌 Bus Tracking

Bus ETA is currently simulated server-side.

A future implementation can replace the simulated data with a real GPS/location feed.

---

# 🔮 Future Development

Kahe One is designed to grow beyond the canteen system.

Possible future improvements include:

- 💳 Real UPI/payment gateway integration
- 🔔 Push notifications
- 🍔 Advanced canteen management
- 📦 Live order tracking
- 🚌 Real-time GPS bus tracking
- 📢 Admin interface for announcements
- 🎫 Campus event management
- 🎓 Additional student services
- 🛡️ Rate limiting and additional API security

### Planned Security Improvement

Rate limiting can be added to order-related endpoints to help prevent abuse of pickup slots and excessive requests.

An admin interface can also be added for managing announcements while keeping administrative endpoints role-protected.

---

# 🌱 Vision

Kahe One is not intended to be just a food-ordering application.

The canteen system is the first step toward a **unified campus platform** where students can access multiple college services from one place.

```text
                 KAHE ONE
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
     🍔 Canteen   📢 News    🚌 Bus
        │           │           │
        └───────────┼───────────┘
                    ↓
              🎓 Student
               Services
                    ↓
          One Campus Platform
```

---

# 🏆 Hackathon Goal

> **How can we make a 20-minute college break actually feel like a 20-minute break?**

Kahe One aims to reduce unnecessary waiting, simplify campus services, and create a better everyday experience for students.

### **One Campus. One Platform. Kahe One.** 🚀codex resume 019fecc-9fc0-7530-8bbd-1cd923f0b0fe
