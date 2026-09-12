@echo off
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/messmitra.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL cannot be empty.
    pause
    exit /b 1
)

echo [1/3] Setting remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [2/3] Setting branch to main...
git branch -M main

echo [3/3] Pushing commits and release tags (v1.0.0, v1.1.0) to GitHub...
git push -u origin main --tags

echo.
echo ========================================================
echo [SUCCESS] Code and release tags pushed to GitHub!
echo ========================================================
pause
