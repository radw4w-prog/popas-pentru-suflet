@echo off
chcp 65001 >nul
title Instalare Popas pentru Suflet
color 0D

echo ╔══════════════════════════════════════════════════════╗
echo ║      📦 INSTALARE POPAS PENTRU SUFLET               ║
echo ╚══════════════════════════════════════════════════════╝
echo.

echo [1/2] 📦 Instalare dependinte Backend...
cd backend
call npm install
echo    ✅ Backend OK!
echo.

echo [2/2] 📦 Instalare dependinte Frontend...
cd ..\frontend
call npm install
echo    ✅ Frontend OK!
echo.

cd ..

echo ╔══════════════════════════════════════════════════════╗
echo ║  ✅ INSTALARE COMPLETA!                              ║
echo ║  Ruleaza start.bat pentru a porni aplicatia          ║
echo ╚══════════════════════════════════════════════════════╝
echo.
pause