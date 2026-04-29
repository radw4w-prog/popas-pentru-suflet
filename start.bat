@echo off
chcp 65001 >nul
title 🕊️ Popas pentru Suflet - Launcher
color 0A

echo ╔══════════════════════════════════════════════════════╗
echo ║         🕊️  POPAS PENTRU SUFLET  🕊️                ║
echo ║         Lansare Aplicatie Completa                   ║
echo ╚══════════════════════════════════════════════════════╝
echo.

:: ══════════════════════════════════════════════════════
:: VERIFICARI PRELIMINARE
:: ══════════════════════════════════════════════════════

echo [1/5] 🔍 Verificare Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js nu este instalat!
    echo    Descarca de la: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo    ✅ Node.js %%v detectat
echo.

echo [2/5] 🔍 Verificare npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm nu este instalat!
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('npm -v') do echo    ✅ npm v%%v detectat
echo.

:: ══════════════════════════════════════════════════════
:: INSTALARE DEPENDINTE (daca lipsesc)
:: ══════════════════════════════════════════════════════

echo [3/5] 📦 Verificare dependinte Backend...
if not exist "backend\node_modules\" (
    echo    📥 Instalare dependinte backend...
    cd backend
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Eroare la instalarea dependintelor backend!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo    ✅ Dependinte backend instalate!
) else (
    echo    ✅ Dependinte backend OK
)
echo.

echo [4/5] 📦 Verificare dependinte Frontend...
if not exist "frontend\node_modules\" (
    echo    📥 Instalare dependinte frontend...
    cd frontend
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Eroare la instalarea dependintelor frontend!
        cd ..
        pause
        exit /b 1
    )
    cd ..
    echo    ✅ Dependinte frontend instalate!
) else (
    echo    ✅ Dependinte frontend OK
)
echo.

:: ══════════════════════════════════════════════════════
:: VERIFICARE FISIER .ENV
:: ══════════════════════════════════════════════════════

if not exist "backend\.env" (
    echo ⚠️  Fisierul backend\.env nu exista! Creare sablon...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/popas-pentru-suflet
        echo OPENAI_API_KEY=your_openai_key_here
        echo FACEBOOK_ACCESS_TOKEN=your_fb_token_here
        echo INSTAGRAM_ACCESS_TOKEN=your_ig_token_here
        echo TIKTOK_ACCESS_TOKEN=your_tiktok_token_here
        echo NODE_ENV=development
    ) > "backend\.env"
    echo    ✅ Fisier .env creat - editeaza-l cu cheile tale API!
    echo.
)

:: ══════════════════════════════════════════════════════
:: PORNIRE SERVERE
:: ══════════════════════════════════════════════════════

echo [5/5] 🚀 Pornire aplicatie...
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  📡 Backend:  http://localhost:5000                  ║
echo ║  🌐 Frontend: http://localhost:3000                  ║
echo ║                                                      ║
echo ║  ⛔ Pentru oprire: inchide ambele ferestre CMD       ║
echo ║     sau apasa CTRL+C in fiecare                      ║
echo ╚══════════════════════════════════════════════════════╝
echo.

:: Pornire Backend in fereastra separata
start "🔧 Backend - Popas pentru Suflet" cmd /k "cd /d %~dp0backend && color 0B && echo ══════════════════════════════════ && echo   🔧 BACKEND SERVER STARTING... && echo ══════════════════════════════════ && echo. && node server.js"

:: Asteptare 3 secunde pentru backend sa porneasca
echo ⏳ Asteptare pornire backend (3 secunde)...
timeout /t 3 /nobreak >nul

:: Pornire Frontend in fereastra separata
start "🌐 Frontend - Popas pentru Suflet" cmd /k "cd /d %~dp0frontend && color 0E && echo ══════════════════════════════════ && echo   🌐 FRONTEND SERVER STARTING... && echo ══════════════════════════════════ && echo. && npm start"

:: Asteptare 5 secunde apoi deschide browser-ul
echo ⏳ Asteptare pornire frontend (5 secunde)...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Deschidere browser...
start http://localhost:3000

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  ✅ APLICATIA RULEAZA!                               ║
echo ║                                                      ║
echo ║  Aceasta fereastra se poate inchide.                  ║
echo ║  Serverele ruleaza in ferestrele separate.            ║
echo ╚══════════════════════════════════════════════════════╝
echo.
pause