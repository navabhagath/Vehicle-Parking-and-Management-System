# Vehicle Parking and Management System

A comprehensive full-stack application for managing vehicle parking facilities with support for multiple user roles including customers, vendors, and administrators.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

### Customer Features

- **User Registration & Authentication**: Secure signup and login with OTP verification
- **Parking Location Discovery**: Browse and search available parking locations
- **Booking Management**: Reserve parking spaces and manage bookings
- **Vehicle Management**: Add and manage multiple vehicles
- **Digital Tickets**: Generate and view parking tickets with QR codes
- **Wallet System**: Digital wallet for seamless transactions
- **Transaction History**: Track all payments and transactions
- **Real-time Notifications**: SMS and email notifications for bookings

### Vendor Features

- **Parking Location Management**: Create and manage parking facilities
- **Gate Pass Management**: Issue and control gate passes
- **Analytics Dashboard**: Comprehensive statistics and revenue analytics
- **Booking Management**: View and manage customer bookings
- **Subscription Management**: Manage vendor subscriptions and plans
- **Revenue Insights**: Detailed revenue reports and charts
- **Vehicle Analytics**: Track vehicle statistics and pie charts
- **Profile Management**: Update vendor profile and business information

### Admin Features

- **User Management**: Manage all user accounts and roles
- **Vendor Management**: Oversee vendor accounts and approvals
- **Dashboard Analytics**: System-wide analytics and insights
- **Revenue Tracking**: Monitor total revenue across the platform
- **System Configuration**: Manage system settings and policies

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose v9.5.0
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator v7.3.2
- **Security**: Helmet.js for HTTP headers
- **File Upload**: Multer v2.1.1
- **Email**: Nodemailer v8.0.7
- **OTP Generation**: OTP Generator v4.0.1
- **API Documentation**: Swagger/OpenAPI with Swagger UI Express
- **Testing**: Mocha, Chai, and NYC for coverage

### Frontend

- **Framework**: Angular v17.3.0
- **Styling**: Bootstrap v5.3.8, SCSS
- **Charts**: ApexCharts, Chart.js
- **PDF Generation**: jsPDF with autotable
- **QR Code**: angularx-qrcode
- **Icons**: Bootstrap Icons
- **Material Design**: Angular Material v17.3.10

## Project Structure

```
project-v1/
├── backend/                          # Node.js/Express backend
│   ├── config/                       # Configuration files
│   │   ├── db.js                    # Database connection
│   │   ├── swagger.js               # Swagger configuration
│   │   ├── adminSwagger.js
│   │   ├── authSwagger.js
│   │   ├── bookingSwagger.js
│   │   └── customerSwagger.js
│   ├── controllers/                  # Request handlers
│   │   ├── admin/                   # Admin controllers
│   │   ├── auth/                    # Authentication controllers
│   │   ├── customer/                # Customer controllers
│   │   └── vendor/                  # Vendor controllers
│   ├── models/                       # Mongoose schemas
│   │   ├── userModel.js
│   │   ├── bookingModel.js
│   │   ├── parkingLocationModel.js
│   │   ├── vehicleModel.js
│   │   └── ...
│   ├── routes/                       # API routes
│   │   ├── index.js
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── customer/
│   │   └── vendor/
│   ├── middlewares/                  # Custom middlewares
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── idMiddleware.js
│   │   ├── upload.js                # File upload handling
│   │   └── vendorLocationValidate.js
│   ├── services/                     # Business logic services
│   │   ├── emailService.js
│   │   └── smsService.js
│   ├── utils/                        # Utility functions
│   ├── test/                         # Test files
│   ├── uploads/                      # Uploaded files storage
│   ├── app.js                        # Express app setup
│   ├── server.js                     # Server entry point
│   └── package.json
│
├── frontend/                         # Angular frontend
│   ├── src/
│   │   ├── app/                     # Angular components and services
│   │   ├── assets/                  # Static assets
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── angular.json                 # Angular configuration
│   ├── tsconfig.json
│   └── package.json
│
└── README.md                        # This file
```

## Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (local or Atlas)
- **Git**

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/vehicle-parking
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

## Configuration

### Environment Setup - Security Notice ⚠️

**IMPORTANT**: The `.env` and `environment.ts` files contain sensitive credentials and are excluded from version control (added to `.gitignore`). These files have been removed from git history for security reasons.

### Backend Environment Setup

1. Copy the example file to create your `.env` file:

```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your actual credentials:

```env
PORT=4000
NODE_ENV=development
SECRET_KEY=your_secret_key_here

CORS_ORIGIN=http://localhost:4200
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

MONGO_URI=mongodb://localhost:27017/vehiclemanagement

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=+1234567890

NODE_OPTIONS=--use-system-ca
```

### Frontend Environment Setup

1. Copy the example file to create your `environment.ts`:

```bash
cd frontend/src/environments
cp environment.ts.example environment.ts
```

2. Edit `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:4000/api",
};
```

### Database Configuration

The database connection is configured in `backend/config/db.js` and uses the `MONGO_URI` from your `.env` file:

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Connection Error:", error);
    process.exit(1);
  }
};
```

### Environment Variables Reference

- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment mode (development/production/test)
- `SECRET_KEY`: Secret key for JWT token signing
- `MONGO_URI`: MongoDB connection string
- `CORS_ORIGIN`: Frontend URL for CORS
- `EMAIL_USER`: Email service username
- `EMAIL_PASSWORD`: Email service password
- `TWILIO_ACCOUNT_SID`: Twilio account SID for SMS
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE`: Twilio phone number for SMS

## Running the Application

### Backend

Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:4000`

Swagger API documentation will be available at:

- `http://localhost:4000/api-docs` (Main API)
- `http://localhost:4000/api/admin/docs` (Admin API)
- `http://localhost:4000/api/auth/docs` (Auth API)

### Frontend

In a new terminal, start the Angular development server:

```bash
npm start
```

The application will be available at `http://localhost:4200`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification

### Customer Endpoints

- `GET /api/customer/parking-locations` - Get available parking locations
- `POST /api/customer/bookings` - Create a booking
- `GET /api/customer/bookings` - Get user bookings
- `GET /api/customer/vehicles` - Get user vehicles
- `POST /api/customer/vehicles` - Add a vehicle
- `GET /api/customer/tickets` - Get parking tickets
- `GET /api/customer/wallet` - Get wallet information

### Vendor Endpoints

- `POST /api/vendor/parking-locations` - Create parking location
- `GET /api/vendor/dashboard` - Vendor dashboard analytics
- `GET /api/vendor/bookings` - View bookings
- `POST /api/vendor/gatepass` - Issue gate pass
- `GET /api/vendor/analytics/revenue` - Revenue analytics

### Admin Endpoints

- `GET /api/admin/users` - List all users
- `GET /api/admin/vendors` - List all vendors
- `GET /api/admin/dashboard` - Admin dashboard analytics
- `GET /api/admin/revenue` - Total revenue report

For complete API documentation, refer to Swagger UI at `/api-docs`

## Testing

Run tests for the backend:

```bash
# Run all tests
npm test

# Generate coverage report
npm run coverage
```

Test files are located in `backend/test/` directory organized by module:

- `test/auth/` - Authentication tests
- `test/admin/` - Admin functionality tests
- `test/customer/` - Customer functionality tests
- `test/vendor/` - Vendor functionality tests

## Key Features Implementation

### Authentication & Security

- JWT-based authentication with refresh tokens
- OTP verification for secure user registration
- Password hashing with bcrypt
- CORS protection
- Helmet security headers

### Payment & Transactions

- Wallet system for customers
- Transaction tracking and history
- Multiple payment method support
- Revenue tracking for vendors and admin

### Notifications

- Email notifications via Nodemailer
- SMS notifications for bookings and updates
- Real-time status updates

### Analytics

- Revenue analytics by vendor and date range
- Booking statistics and trends
- Vehicle usage analytics
- Customer and vendor metrics

## Security & Best Practices

### Protecting Sensitive Information

1. **Never commit `.env` files**: Always use `.env.example` templates
2. **Git Credentials**: Use git credentials or SSH keys, never commit credentials
3. **Sensitive Data Removed**: The `.env` file containing credentials has been removed from git history
4. **Template Files**: Use `.env.example` and `environment.ts.example` as reference for your local setup

### Security Headers

The application uses Helmet.js to set secure HTTP headers:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- HSTS (HTTP Strict Transport Security)

### Authentication

- JWT-based authentication with expiring tokens
- Bcrypt password hashing
- OTP verification for sensitive operations
- Role-based access control (RBAC)

### Data Protection

- MongoDB data encryption at rest (configure in production)
- HTTPS/TLS in production
- Input validation with express-validator
- SQL/NoSQL injection prevention

## Contributing

1. Create a new branch for your feature:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and commit:

```bash
git commit -m "Add your feature description"
```

3. Push to the branch:

```bash
git push origin feature/your-feature-name
```

4. Open a Pull Request with a clear description of your changes

## Future Enhancements

- [ ] Mobile app for Android/iOS
- [ ] Real-time payment gateway integration
- [ ] Advanced analytics and reporting
- [ ] Machine learning for demand prediction
- [ ] IoT integration for smart parking
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally or check your Atlas connection string
- Verify `MONGODB_URI` in `.env` file

### Port Already in Use

- Change the `PORT` variable in `.env` file
- Or kill the process using the port: `lsof -ti:4000 | xargs kill -9` (Unix) or `netstat -ano | findstr :4000` (Windows)

### Missing Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Last Updated**: May 2026  
**Version**: 1.0.0
