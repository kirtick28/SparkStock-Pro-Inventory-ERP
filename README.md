# 🎉 Final-Crackers: Inventory ERP System

**Final-Crackers** is a powerful, full-stack Inventory Enterprise Resource Planning (ERP) system designed to optimize business operations with a sleek, modern interface. Built with a **React 19** frontend and a **Node.js/Express** backend, it offers robust user management, company oversight, customer relations, and insightful analytics.

---

## 🌟 Key Features

| Feature                      | Description                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **🔐 Secure Authentication** | JWT-based login with role-based access (Super Admin, Sub Admin).             |
| **👑 Super Admin Panel**     | Manage Sub Admins, create/edit companies, and control activation status.     |
| **🏢 Company Management**    | Create, update, and toggle company profiles with ease.                       |
| **🤝 Customer Management**   | Add, edit, and track customer details, orders, and status (active/inactive). |
| **📦 Inventory & Orders**    | Manage products, stock, orders, and generate PDF invoices.                   |
| **🎁 Gift Box Management**   | Create and manage custom gift box offerings.                                 |
| **🛒 Cart Functionality**    | Streamlined order creation with cart integration.                            |
| **📊 Analytics Dashboard**   | Visualize revenue, invoices, customers, and sales trends with Chart.js.      |
| **🖨️ PDF Invoices**          | Auto-generate and upload invoices to Cloudinary.                             |
| **🌈 Responsive UI**         | Modern, responsive design with TailwindCSS and theme toggle (Light/Dark).    |

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 19 (with Vite)
- **Styling**: TailwindCSS, Custom CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Animations**: Framer Motion
- **Charts**: Chart.js (via react-chartjs-2)
- **Icons**: Lucide React, React Icons
- **Notifications**: React Toastify

### Backend

- **Framework**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT)
- **Middleware**: CORS, Morgan
- **File Storage**: Cloudinary (for PDFs)
- **Utilities**: Moment.js, Dotenv

---

## 🚀 Getting Started

Follow these steps to set up **Final-Crackers** locally for development or testing.

### Prerequisites

- **Node.js** (v14+)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)
- **Git** (for cloning)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with:
   ```env
   PORT=5000
   DATABASE=mongodb://localhost:27017/final-crackers-db
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the backend server:
   ```bash
   node index.js
   ```
   Or, with `nodemon` for development:
   ```bash
   nodemon index.js
   ```
   The server runs at `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory with:
   ```env
   VITE_BASEURL=http://localhost:5000/api
   ```
4. Start the frontend server:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173` (or as indicated in the terminal).

---

## ⚙️ How to Use

### Super Admin

- **Setup**: Create an initial Super Admin via the database or a setup script (if provided).
- **Capabilities**:
  - Manage Sub Admins (create, edit, activate/deactivate).
  - Create and assign companies to Sub Admins.
  - Oversee system-wide operations.

### Sub Admin

- **Access**: Assigned by Super Admin, tied to a specific company.
- **Capabilities**:
  - Monitor company metrics (revenue, orders, customers).
  - Manage customers and their order history.
  - Create invoices and manage inventory/gift boxes.

---

## 🎨 UI & Design

- **Responsive**: Adapts seamlessly to all screen sizes.
- **Theming**: Toggle between Light and Dark modes.
- **Animations**: Smooth transitions powered by Framer Motion.
- **Styling**: Clean, modern design with TailwindCSS.

### Screenshots

- **Login Page**  
  ![Login Page](https://res.cloudinary.com/dkro770eh/image/upload/v1747217538/Screenshot_2025-05-14_152636_lnb4hs.png)
- **Super Admin Panel**  
  ![Sub Admin Management](https://res.cloudinary.com/dkro770eh/image/upload/v1747217538/Screenshot_2025-05-14_152649_mvxsdm.png)
- **Sub Admin Dashboard**  
  ![Dashboard](https://res.cloudinary.com/dkro770eh/image/upload/v1747217538/Screenshot_2025-05-14_152707_ohojvk.png)
- **Customer Management**  
  ![Customer View](https://res.cloudinary.com/dkro770eh/image/upload/v1747217537/Screenshot_2025-05-14_152735_jzkw5s.png)
- **Invoice Example**  
  ![Invoice](https://res.cloudinary.com/dkro770eh/image/upload/v1747217537/Screenshot_2025-05-14_152941_fbtcts.png)  
  _[View Sample PDF Invoice](https://res.cloudinary.com/dkro770eh/raw/upload/v1747216779/Mahesh%20Crackers%20Shop/Vignesh_2025-05-14_15-29-36.pdf)_

---

## 🤝 Contributing

We welcome contributions to enhance **Final-Crackers**! To contribute:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request.

Ensure your code follows the project's style guide and passes all tests.

---

## 📬 Contact

For questions or support, reach out via [GitHub Issues](https://github.com/your-repo/final-crackers/issues).

Happy Managing! 🚀
