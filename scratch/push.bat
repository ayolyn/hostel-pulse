@echo off
cd /d "%~dp0\.."
echo ==================================================
echo Pushing latest HostelPulse audited commits to GitHub...
echo ==================================================
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Pushed to GitHub! Cloudflare Pages build triggered automatically.
) else (
    echo.
    echo [FAILED] If prompted for GitHub login in your browser, please approve it.
)
pause
