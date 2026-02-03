@echo off
echo Starting Trading Website...

:: Start Frontend
start "Trading Website Frontend" cmd /k "cd Trading-website-main && npm start"

:: Start Backend
start "Trading Website Backend" cmd /k "cd Trading-website-main\backend && php artisan serve"

echo commands executed. check the new windows.
