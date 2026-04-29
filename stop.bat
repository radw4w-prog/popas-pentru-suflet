@echo off
chcp 65001 >nul
title Oprire Popas pentru Suflet
color 0C

echo ╔══════════════════════════════════════════════════════╗
echo ║         ⛔ OPRIRE POPAS PENTRU SUFLET                ║
echo ╚══════════════════════════════════════════════════════╝
echo.

echo 🔴 Oprire procese Node.js...
taskkill /F /IM node.exe >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo    ✅ Toate procesele Node.js au fost oprite
) else (
    echo    ℹ️  Nu au fost gasite procese Node.js active
)
echo.

echo ✅ Aplicatia a fost oprita complet!
echo.
pause