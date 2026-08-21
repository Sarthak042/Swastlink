#  SwasthLink (Swastlink)

> **Real-Time Healthcare Resource Allocation & Emergency Response Platform**

SwasthLink is a modern, full-stack healthcare ecosystem designed to bridge the gap between patients, hospitals, and pharmacies. Powered by real-time WebSockets, intelligent geospatial mapping, fuzzy search, OCR prescription reading, and predictive resource forecasting, SwasthLink ensures critical medical care is accessible when every second counts.

---

##  Key Features

###  Emergency SOS & Interactive Map
- **Live Location Tracking:** Uses Leaflet maps and the Haversine formula to compute exact distances to nearest emergency care centers.
- **Instant SOS Dispatch:** One-tap emergency broadcast over Socket.io notifying nearby hospital emergency desks.

###  Hospital Bed Management & Real-Time Booking
- **Live Bed Tracking:** Monitors availability across ICU, Oxygen, Ventilator, and General ward beds.
- **Instant Booking Requests:** Reserve hospital beds with automated status tracking.
- **QR Code Check-in:** Generates secure QR codes for verified booking verification upon hospital arrival.

###  Pharmacy Portal & Prescription Scanner
- **Medicine Search:** Instant fuzzy search across local pharmacy inventories powered by Fuse.js.
- **OCR Prescription Scanner:** Read and extract medicine names directly from uploaded prescription images using Tesseract.js.
- **Real-Time Inventory Updates:** Enables pharmacies to manage stock levels and fulfill patient reservations.

###  Admin Analytics & Predictive Resource Forecasting
- **Hospital Dashboard:** Real-time metrics on bed occupation, incoming patient requests, and pending SOS alerts.
- **Demand Forecasting:** Algorithmic forecasting (`utils/forecast.js`) predicting future bed and resource requirements based on historical utilization data.
- **Role-Based Access Control (RBAC):** Secure JWT authentication tailored for Patients, Hospital Admins, and Pharmacy Vendors.

---

##  Tech Stack

### **Frontend (`/client`)**
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + PostCSS
- **Mapping:** Leaflet & React-Leaflet
- **Real-Time:** Socket.io-client
- **Charts:** Recharts
- **Fuzzy Search & OCR:** Fuse.js, Tesseract.js
- **Icons & QR:** Lucide React, QRCode

### **Backend (`/server`)**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB & Mongoose
- **Real-Time:** Socket.io
- **Security & Auth:** JSON Web Tokens (JWT), BcryptJS, CORS
- **Utilities:** Custom Haversine Distance Calculator & Predictive Forecasting Engine

---

## 📂 Project Structure

```
Swastlink/
├── client/                     # Vite + React Frontend Application
│   ├── public/                 # Static assets & images
│   └── src/
│       ├── components/         # Reusable UI (Modals, Map, Navbar)
│       ├── context/            # Auth & Socket Context providers
│       ├── pages/              # Patient, Admin, Pharmacy & Auth dashboards
│       ├── App.jsx             # Main Application Routing
│       └── main.jsx            # Entry point
├── server/                     # Node.js + Express Backend API
│   ├── config/                 # Database configuration (MongoDB)
│   ├── controllers/            # API Route logic (Auth, Bed, Booking, Pharmacy)
│   ├── middleware/             # JWT Authentication Middleware
│   ├── models/                 # Mongoose Data Schemas
│   ├── routes/                 # Express API Endpoint definitions
│   ├── utils/                  # Forecast engine, Haversine math, DB Seeder
│   └── server.js               # Express application & Socket.io server
├── .gitignore                  # Git untracked pattern rules
└── README.md                   # Project documentation
```

---

##  Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: Local instance or MongoDB Atlas Connection URI

---

### 1️⃣ Installation

Clone the repository and install dependencies for both `client` and `server`:

```bash
# Clone repository
git clone https://github.com/Sarthak042/Swastlink.git
cd Swastlink

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 2️⃣ Environment Configuration

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/swasthlink
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

*(Refer to `server/.env.example` for reference)*

---

### 3️⃣ Database Seeding (Optional)

To populate the database with sample hospitals, beds, medicines, and pharmacies:

```bash
cd server
npm run seed
```

---

### 4️⃣ Running the Application

#### Start Backend Server:
```bash
cd server
npm run dev
```
*Server will start on `http://localhost:5000` with WebSockets enabled.*

#### Start Frontend Client:
```bash
cd client
npm run dev
```
*Frontend dev server will launch at `http://localhost:5173`.*

---

## 🛡️ API Endpoints Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | User Registration |
| **Auth** | `POST` | `/api/auth/login` | User Authentication & Token Generation |
| **Hospitals**| `GET` | `/api/hospitals` | List hospitals with coordinates & live bed counts |
| **Beds** | `GET` | `/api/beds` | Retrieve bed availability by hospital |
| **Bookings**| `POST` | `/api/bookings` | Request a bed booking with QR generation |
| **Pharmacy**| `GET` | `/api/pharmacies/search` | Search medicine inventory across local shops |
| **Vaccines**| `GET` | `/api/vaccines` | Track vaccine slot availability |

---

##  Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to enhance features or optimize performance.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

##  License

Distributed under the **ISC License**. See `LICENSE` for more information.
