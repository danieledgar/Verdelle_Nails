# Verdelle Nails

A comprehensive nail salon management system featuring a customer-facing website and administrative dashboard. Built with modern web technologies to provide seamless online booking, service showcase, and business management capabilities.

##  Main Function

Verdelle Nails is a full-stack web application designed to streamline nail salon operations by providing:

- **Customer Portal**: Allow clients to browse services, view gallery, book appointments, and make payments
- **Admin Dashboard**: Comprehensive management interface for salon staff to manage bookings, services, reviews, and transactions
- **M-Pesa Integration**: Secure payment processing for Kenyan customers
- **Real-time Booking**: Instant appointment scheduling with automated conflict detection

##  Key Features

### Customer-Facing Website (Frontend)
- **Service Showcase**: Browse all nail services with detailed descriptions, pricing, and duration
- **Online Booking**: Real-time appointment scheduling with calendar integration
- **Gallery**: Beautiful showcase of nail art and previous work
- **M-Pesa Payments**: Secure payment integration for appointments
- **User Profiles**: Account management with booking history
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop
- **Reviews**: View customer testimonials and ratings
- **Contact Forms**: Easy communication with the salon

### Admin Dashboard
- **Dashboard Analytics**: Overview of appointments, revenue, and key metrics
- **Appointment Management**: View, update, and manage all bookings
- **Service Categories**: Organize services into categories
- **Review Management**: Moderate and respond to customer reviews
- **Message Center**: Manage customer inquiries from contact forms
- **Transaction Tracking**: Monitor all payments and M-Pesa transactions
- **Elegant UI**: Matching design theme with gradient effects and smooth animations

### Technical Features
- **Authentication**: Secure JWT-based user authentication
- **PostgreSQL Database**: Robust data storage and management
- **Modern UI/UX**: Premium design with Playfair Display and Poppins fonts
- **Consistent Theming**: Gold (#c9a684) and charcoal (#2c2c2c) color scheme
- ⚡ **Fast Performance**: Optimized React components and Django REST API

##  Technology Stack

### Frontend
- **Framework**: React 18
- **Styling**: Styled-components with custom theme
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

### Admin Panel
- **Framework**: React 18
- **Port**: 3001
- **Styling**: Shared styled-components with frontend theme

### Backend
- **Framework**: Django 4.x with Django REST Framework
- **Authentication**: JWT tokens
- **Database**: PostgreSQL
- **Payment**: M-Pesa Daraja API integration
- **Media Storage**: Django file handling for images

##  Running the Application

### Prerequisites
- Python 3.8+ installed
- Node.js 14+ and npm installed
- PostgreSQL database installed and running

### Quick Start (Using Setup Scripts)

#### Linux/Mac:
```bash
# Backend
chmod +x setup-backend.sh
./setup-backend.sh

# Frontend (in a new terminal)
chmod +x setup-frontend.sh
./setup-frontend.sh
```

#### Windows:
```cmd
# Backend
setup-backend.bat

# Frontend (in a new terminal)
setup-frontend.bat
```

### Manual Setup

#### 1. Database Setup
```sql
# Create PostgreSQL database
CREATE DATABASE verdelle_nails;
CREATE USER verdelle_user WITH PASSWORD 'your_password';
ALTER ROLE verdelle_user SET client_encoding TO 'utf8';
ALTER ROLE verdelle_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE verdelle_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE verdelle_nails TO verdelle_user;
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv ../venv
source ../venv/bin/activate  # Windows: ..\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with:
SECRET_KEY=your-django-secret-key-here
DEBUG=True
DB_NAME=verdelle_nails
DB_USER=verdelle_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser

# Populate initial data (optional)
python manage.py shell < populate_services.py
python manage.py shell < populate_gallery.py

# Start backend server
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm start
```

Frontend will run at: `http://localhost:3000`

#### 4. Admin Panel Setup
```bash
# Navigate to admin directory
cd admin

# Install dependencies
npm install

# Start admin development server
npm start
```

Admin panel will run at: `http://localhost:3001`

## 📱 Application Access

- **Customer Website**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

##  Usage Guide

### For Customers:
1. Visit http://localhost:3000
2. Browse services and gallery
3. Create an account or login
4. Book an appointment from the Services page
5. Complete payment via M-Pesa
6. View booking history in your profile

### For Administrators:
1. Visit http://localhost:3001
2. Login with admin credentials
3. View dashboard for overview
4. Manage categories, reviews, messages, and transactions
5. Monitor all appointments and payments

## Default Admin Credentials

After creating a superuser, use those credentials to access:
- Admin Dashboard (http://localhost:3001)
- Django Admin (http://localhost:8000/admin)

## Additional Documentation

- [Authentication Setup](AUTHENTICATION_SETUP.md)
- [M-Pesa Integration](MPESA_INTEGRATION.md)
- [Gallery Setup](GALLERY_SETUP.md)
- [Development Guide](DEVELOPMENT.md)

##  Design Theme

- **Primary Color**: Gold (#c9a684)
- **Secondary Color**: Charcoal (#2c2c2c)
- **Accent Color**: Light Gold (#d4af8e)
- **Background**: Off-white (#fafafa)
- **Fonts**: Playfair Display (headings), Poppins (body)

## Contributing

This is a private project for Verdelle Nails salon.

## License

© 2026 Verdelle Nails. All rights reserved.
