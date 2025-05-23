@echo off
REM Script to commit changes and add a tag to LiteGallery

echo ========================================================
echo LiteGallery Git Commit and Tag Tool
echo ========================================================
echo.

REM Check if inside a Git repository
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Not inside a Git repository. Please run this script from a Git repository.
    exit /b 1
)

REM Get current date in YYYY-MM-DD format
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%
set today=%year%-%month%-%day%

REM Ask for commit message with default
set DEFAULT_MESSAGE=Update LiteGallery with documentation and deployment scripts
set /p COMMIT_MESSAGE=Enter commit message [%DEFAULT_MESSAGE%]: 
if "%COMMIT_MESSAGE%"=="" set COMMIT_MESSAGE=%DEFAULT_MESSAGE%

REM Ask for tag version
set DEFAULT_VERSION=v1.0.0
set /p TAG_VERSION=Enter version tag [%DEFAULT_VERSION%]: 
if "%TAG_VERSION%"=="" set TAG_VERSION=%DEFAULT_VERSION%

REM Ask for tag message with default
set DEFAULT_TAG_MESSAGE=LiteGallery %TAG_VERSION% release
set /p TAG_MESSAGE=Enter tag message [%DEFAULT_TAG_MESSAGE%]: 
if "%TAG_MESSAGE%"=="" set TAG_MESSAGE=%DEFAULT_TAG_MESSAGE%

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "%COMMIT_MESSAGE%"

echo.
echo Creating tag %TAG_VERSION%...
git tag -a %TAG_VERSION% -m "%TAG_MESSAGE%"

echo.
echo ========================================================
echo Summary:
echo - All changes have been committed with message: "%COMMIT_MESSAGE%"
echo - Tag %TAG_VERSION% has been created with message: "%TAG_MESSAGE%"
echo.
echo To push changes and tag to remote repository:
echo   git push origin master
echo   git push origin %TAG_VERSION%
echo ========================================================
echo.

set /p PUSH_NOW=Do you want to push changes and tags now? (Y/N): 
if /i "%PUSH_NOW%"=="Y" (
    echo.
    echo Pushing commits and tags to remote repository...
    git push origin master
    git push origin %TAG_VERSION%
    echo.
    echo Pushed successfully!
)

pause
