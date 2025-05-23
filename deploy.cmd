@echo off
REM Deploy script for LiteGallery to GitHub

echo ========================================================
echo LiteGallery GitHub Deployment Tool
echo ========================================================
echo.

REM Ask for GitHub username
set /p GITHUB_USERNAME=Enter your GitHub username: 

REM Ask for repository name, default to LiteGallery
set /p REPO_NAME=Enter repository name [LiteGallery]: 
if "%REPO_NAME%"=="" set REPO_NAME=LiteGallery

echo.
echo Creating Git repository...
git init

echo.
echo Adding files to repository...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit of LiteGallery - a lightweight image carousel library"

echo.
echo Connecting to GitHub repository...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo Pushing to GitHub...
git push -u origin master

echo.
echo ========================================================
echo Deployment completed!
echo.
echo Next steps:
echo 1. Set up GitHub Pages to showcase your demo:
echo    - Go to your repository on GitHub: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo    - Click 'Settings'
echo    - Navigate to 'Pages' in the left sidebar
echo    - Under 'Source', select 'master branch' or 'main branch'
echo    - Click 'Save'
echo.
echo 2. After a few minutes, your demo will be available at:
echo    https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/
echo ========================================================
echo.

pause
