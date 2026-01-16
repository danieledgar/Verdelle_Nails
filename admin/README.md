# Verdelle Nails Admin Panel

Admin panel for managing Verdelle Nails salon - appointments, services, gallery, and users.

## Setup

```bash
# Install dependencies
npm install

# Start development server (runs on port 3001)
npm start

# Build for production
npm build
```

## Login Credentials

Use your **Django superuser credentials** to login:
- The same username and password you created with `python manage.py createsuperuser`
- Any Django user with `is_staff=True` or `is_superuser=True` can access the admin panel

## Features

- 📊 Dashboard with statistics and analytics
- 📅 Appointment management with status tracking
- 💅 Service catalog management
- 🖼️ Gallery image uploads and management
- 👥 User management and access control

## Configuration

The admin panel connects to the main backend API at `http://localhost:8000/api`. Update `.env` file to change the API URL.

## Running with Main Application

1. Start the backend server (port 8000)
2. Start the main frontend (port 3000)
3. Start the admin panel (port 3001)

Each runs independently but shares the same backend API, database, and theme styling.

## Theme

The admin panel uses the **same theme** as the main website for consistency:
- Primary color: Elegant gold (#c9a684)
- Fonts: Playfair Display (headings) and Poppins (body)
- All styling matches the main Verdelle Nails branding
