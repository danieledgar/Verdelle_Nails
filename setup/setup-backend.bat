@echo off
echo ========================================
echo   Verdelle Nails - Backend Setup
echo ========================================

cd backend

echo.
echo Creating virtual environment...
python -m venv venv

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file. Please update with your database credentials.
)

echo Running database migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo Create a superuser for Django admin:
python manage.py createsuperuser

echo.
echo Backend setup complete!
echo To start the server, run:
echo   cd backend
echo   venv\Scripts\activate
echo   python manage.py runserver

pause
