## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v14 or newer recommended)
- npm or yarn
- MongoDB (ensure your MongoDB server is running)
- Git (for cloning)

### Backend Setup

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    If `package.json` is not present, initialize it first:

    ```bash
    npm init -y
    ```

    Then install the required packages:

    ```bash
    npm install express mongoose morgan dotenv cors jsonwebtoken cloudinary moment
    ```

    If `package.json` already exists with these dependencies, simply run:

    ```bash
    npm install
    ```

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

## 📄 API Endpoints Overview

The backend exposes the following primary API routes under the `/api` prefix:

- `POST /api/auth/superadmin-login`
- `POST /api/auth/subadmin-login`
- `POST /api/auth/register-superadmin` (Potentially for initial setup)
- `POST /api/user/create-subadmin` (Super Admin)
- `GET /api/user/sub-admins` (Super Admin)
- `PUT /api/user/update-subadmin` (Super Admin/Sub Admin for own profile)
- `PUT /api/user/` (Update Super Admin profile)
- `GET /api/user/profile` (Authenticated users)
- `POST /api/company` (Create company - likely Super Admin)
- `GET /api/company` (Get all companies - likely Super Admin)
- `GET /api/company/dropdown` (For populating company selection)
- `PUT /api/company` (Update company - likely Super Admin)
- `GET /api/customer/` (Sub Admin - get all customers for their company)
- `GET /api/customer/single` (Sub Admin - get a single customer)
- `POST /api/customer/add` (Sub Admin - add customer)
- `PUT /api/customer/` (Sub Admin - update customer)
- `GET /api/customer/history` (Sub Admin - get customer history)
- `/api/product/*` (Routes for product management)
- `/api/order/*` (Routes for order management, including `/api/order/stats` for dashboard)
- `/api/giftbox/*` (Routes for giftbox management)
- `/api/cart/*` (Routes for cart management)

_(This is a summary based on `backend/index.js` and route files. Refer to specific route files in `backend/routes/` for detailed parameters and functionalities.)_

## 📸 Screenshots (Placeholder)

_(Consider adding screenshots or GIFs of the application here to showcase its features and UI, for example:)_

- Login Page
- Super Admin Dashboard
- Sub Admin Dashboard
- Customer Management View
- Invoice Creation Form

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to Final-Crackers, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Open a Pull Request.

Please ensure your code adheres to the existing style and all tests pass.

## 📜 License

(Specify your project's license here, e.g., MIT License, Apache 2.0, etc. If undecided, you can state "This project is currently unlicensed.")

---

Happy Coding! 🚀
