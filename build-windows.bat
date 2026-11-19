@echo off
chcp 65001 >nul
echo MAXWORLD - створення інсталятора Windows
where node >nul 2>nul || (echo Не знайдено Node.js. Встанови Node.js LTS та повтори. & pause & exit /b 1)
where npm >nul 2>nul || (echo Не знайдено npm. & pause & exit /b 1)
echo Встановлення пакетів...
npm install
if errorlevel 1 (echo Помилка npm install & pause & exit /b 1)
echo Створення інсталятора Windows x64 та x86...
npm run build:win
if errorlevel 1 (echo Помилка створення інсталятора & pause & exit /b 1)
echo Готові файли знаходяться у папці dist.
pause
