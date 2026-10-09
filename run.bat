@echo off
cd /d "%~dp0"
if not defined ADMIN_TOKEN set "ADMIN_TOKEN=dev-seven-%RANDOM%-%RANDOM%"
echo.
echo Seven Perfume local test server
node server.js
pause
