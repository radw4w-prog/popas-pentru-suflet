@echo off
chcp 65001 nul
title Import Biblie BVDCS
color 0B

echo ╔══════════════════════════════════════════════════════╗
echo ║         📖 IMPORT BIBLIE BVDCS în MongoDB            ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo ⚠️  Asigură-te că MongoDB rulează!
echo.
pause

cd Epopas-pentru-sufletbackendscripts
node importBible.js

echo.
echo ✅ Import finalizat!
pause