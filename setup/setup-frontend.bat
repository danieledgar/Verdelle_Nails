@echo off
echo ========================================
echo   Verdelle Nails - Frontend Setup
echo ========================================

cd frontend

echo.
echo Installing npm dependencies...
call npm install

echo Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file.
)

echo.
echo Frontend setup complete!
echo To start the development server, run:
echo   cd frontend
echo   npm start

pause
