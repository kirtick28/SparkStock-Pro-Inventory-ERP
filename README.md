# 🎉 Final-Crackers: Inventory ERP System 🎉

Welcome to **Final-Crackers**, a comprehensive Inventory Enterprise Resource Planning (ERP) system designed to streamline and manage business operations efficiently. This full-stack application features a React-based frontend and a Node.js/Express backend, complete with user roles, company management, customer relations, and much more.

## ✨ Features

- **User Authentication & Authorization:**
  - Secure JWT (JSON Web Token) based authentication.
  - Role-based access control:
    - **Super Admin:** Overall control, manages sub-admins and companies.
    - **Sub Admin:** Manages operations for their assigned company (customers, inventory, orders).
- **Admin Management (Super Admin Panel):**
  - Create, view, update, and activate/deactivate Sub Admins.
  - Create new companies or assign existing ones to Sub Admins.
- **Company Management:**
  - Create, view, and update company profiles.
  - Toggle company activation status.
- **Customer Relationship Management (CRM - Sub Admin Panel):**
  - Add, view, and update customer details.
  - Track customer order history.
  - Manage customer status (active/inactive).
- **Inventory & Product Management (Implied):**
  - Foundation for managing products and stock levels.
- **Order Management & Billing (Sub Admin Panel):**
  - Create and manage orders/invoices.
  - View order statistics and revenue.
- **Gift Box Management (Implied):**
  - Functionality to manage gift boxes.
- **Cart Functionality (Implied):**
  - Basic cart features for order creation.
- **Dashboard & Analytics:**
  - Visual dashboard for Sub Admins displaying key metrics:
    - Total Revenue & Monthly Revenue
    - Total Invoices
    - Total Customers
    - Sales distribution charts.
- **PDF Invoice Generation:**
  - Automatic upload of generated PDF invoices to Cloudinary.
- **Responsive UI:**
  - User-friendly interface built with React and TailwindCSS.
  - Dark/Light theme toggle for user preference.

## 🛠️ Tech Stack

**Frontend:**

- **Framework/Library:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS, CSS
- **State Management:** React Context API (for Auth and Theme)
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Animations:** Framer Motion
- **Icons:** Lucide React, React Icons
- **Charting:** Chart.js (via react-chartjs-2)
- **Notifications:** React Toastify

**Backend:**

- **Framework:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT)
- **Middleware:** CORS, Morgan (HTTP request logger)
- **Environment Variables:** Dotenv
- **File Storage (PDFs):** Cloudinary
- **Utilities:** Moment.js

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14 or newer recommended)
- npm
- MongoDB (ensure your MongoDB server is running)
- Git (for cloning)

### Backend Setup

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    If a `package.json` file exists in this directory (which is expected if you've cloned the project), install all listed dependencies by running:

    ```bash
    npm install
    ```

    This will create a `node_modules` folder and install everything specified in `package.json`.

3.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory and add the following (replace with your actual credentials):

    ```env
    PORT=5000
    DATABASE=mongodb://localhost:27017/final-crackers-db # Your MongoDB connection string
    JWT_SECRET=your_very_strong_jwt_secret_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4.  **Start the backend server:**
    ```bash
    node index.js
    ```
    Or, if you have `nodemon` installed for development:
    ```bash
    nodemon index.js
    ```
    The backend server should now be running (typically on `http://localhost:5000`).

### Frontend Setup

1.  **Navigate to the frontend directory:**

    ```bash
    cd ../frontend
    ```

    (Assuming you are in the `backend` directory from the previous step. If you are in the root `Final-Crackers` directory, just `cd frontend`)

2.  **Install dependencies:**

    ```bash
    npm install
    ```

    (or `yarn install`)

3.  **Set up environment variables:**
    Create a `.env` file in the `frontend` directory (if one doesn't exist, check `vite.config.js` for how environment variables are handled, but `VITE_BASEURL` is commonly used this way).
    Add the following, pointing to your backend API:

    ```env
    VITE_BASEURL=http://localhost:5000/api
    ```

4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend application should now be accessible, typically at `http://localhost:5173` (Vite's default port, check your terminal output).

## ⚙️ How to Work with the Project

1.  **Super Admin:**

    - The system likely requires an initial Super Admin user. This might need to be created directly in the database or via a specific setup script (not detailed in current files, common practice).
    - Super Admins can log in and access their dashboard to:
      - Manage (create, view, edit, activate/deactivate) Sub Admin accounts.
      - Manage (create, view, edit, activate/deactivate) Company profiles.
      - Assign companies to Sub Admins.

2.  **Sub Admin:**
    - Sub Admins are created by the Super Admin and assigned to a company.
    - Upon logging in, Sub Admins can access their dashboard to:
      - View company performance metrics (revenue, orders, customers).
      - Manage customers (add, edit, view details, manage status).
      - Create and manage invoices/bills for customers.
      - Manage inventory, products, and gift boxes (based on available routes).

## 🎨 UI & Styling

- The frontend uses **TailwindCSS** for rapid UI development and a modern look.
- **Dark Mode** and **Light Mode** are supported and can be toggled by the user.
- Components are designed to be responsive across various screen sizes.
- **Framer Motion** is used for smooth animations and transitions.

## 📸 Screenshots

- ### Login Page:
  ![Login Page](https://res.cloudinary.com/dkro770eh/image/upload/v1747217538/Screenshot_2025-05-14_152636_lnb4hs.png)
- ### Super Admin - Sub Admin Management:
  ![Super Admin - Sub Admin Management](https://res.cloudinary.com/dkro770eh/image/upload/v1747217538/Screenshot_2025-05-14_152649_mvxsdm.png)
- ### Sub Admin Dashboard:
  ![Sub Admin Dashboard](https://res.cloudinary.com/dkro770eh/image/upload/v1747217538/Screenshot_2025-05-14_152707_ohojvk.png)
- ### Customer Management View:
  ![Customer Management View](https://res.cloudinary.com/dkro770eh/image/upload/v1747217537/Screenshot_2025-05-14_152735_jzkw5s.png)
- ### Invoice Generation:
  ![Invoice Generation Example 1](https://res.cloudinary.com/dkro770eh/image/upload/v1747217537/Screenshot_2025-05-14_152941_fbtcts.png)
  _View an example of a generated PDF invoice: [Sample Invoice PDF](https://res.cloudinary.com/dkro770eh/raw/upload/v1747216779/Mahesh%20Crackers%20Shop/Vignesh_2025-05-14_15-29-36.pdf)_

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to Final-Crackers, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Open a Pull Request.

Please ensure your code adheres to the existing style and all tests pass.

---

Happy Coding! 🚀
