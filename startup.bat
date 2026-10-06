@echo off
rem ---------------------------------------------------------------------------
rem  SOCIALxBRAND PILOT: one-click local launcher (Windows)
rem
rem    startup.bat              dev server with hot reload (default)
rem    startup.bat prod         production build, then the production server
rem    startup.bat 3200         use port 3200 instead of 3100
rem    startup.bat --no-open    do not open the browser
rem    startup.bat help         show this help
rem
rem  Arguments can be combined in any order, e.g.  startup.bat prod 3200 --no-open
rem  Port 3100 is the default because 3000 is often taken by another project.
rem  If the chosen port is busy, the next free one is used automatically.
rem ---------------------------------------------------------------------------
setlocal EnableExtensions
cd /d "%~dp0"
title SOCIALxBRAND PILOT

set "MODE=dev"
set "PORT=3100"
set "OPEN=1"

:args
if "%~1"=="" goto argsdone
if /i "%~1"=="dev"       (set "MODE=dev"  & shift & goto args)
if /i "%~1"=="prod"      (set "MODE=prod" & shift & goto args)
if /i "%~1"=="--no-open" (set "OPEN=0"    & shift & goto args)
if /i "%~1"=="help"      goto help
if /i "%~1"=="-h"        goto help
if /i "%~1"=="--help"    goto help
if    "%~1"=="/?"        goto help
rem a port is all digits: strip digits as delimiters and see whether anything is left
set "REST="
for /f "delims=0123456789" %%x in ("%~1") do set "REST=%%x"
if not defined REST (set "PORT=%~1" & shift & goto args)
echo [x] Unknown option: %~1
echo.
goto help_fail
:argsdone

echo.
echo   SOCIALxBRAND PILOT  ^|  local launcher  ^|  mode: %MODE%
echo   -------------------------------------------------------
echo.

rem --- 1. Node.js (Next 16 needs 20.9 or newer) --------------------------------
rem (run node itself rather than "where": a missing command sets errorlevel 9009;
rem  "call" so a node.cmd shim from a version manager returns here instead of ending the script)
call node -v >nul 2>nul
if errorlevel 1 (
  echo [x] Node.js was not found on PATH.
  echo     Install the LTS version from https://nodejs.org and run this again.
  goto fail
)
set "NODE_MAJOR="
set "NODE_MINOR="
for /f "tokens=1,2 delims=v." %%a in ('node -v') do (
  set "NODE_MAJOR=%%a"
  set "NODE_MINOR=%%b"
)
if not defined NODE_MAJOR (
  echo [x] Could not read the Node.js version.
  goto fail
)
set "NODE_OK=1"
if %NODE_MAJOR% LSS 20 set "NODE_OK=0"
if %NODE_MAJOR% EQU 20 if %NODE_MINOR% LSS 9 set "NODE_OK=0"
if "%NODE_OK%"=="0" (
  echo [x] Node.js %NODE_MAJOR%.%NODE_MINOR% is too old. This site needs 20.9 or newer.
  echo     Install the LTS version from https://nodejs.org and run this again.
  goto fail
)
echo [ok] Node.js %NODE_MAJOR%.%NODE_MINOR%

rem --- 2. Dependencies: install only when missing or older than package-lock --
call node scripts\tooling\deps-fresh.mjs
if errorlevel 1 (
  echo [..] Installing dependencies ^(first run or package-lock changed^)...
  call npm install
  if errorlevel 1 (
    echo [x] npm install failed. Check the messages above.
    goto fail
  )
)
echo [ok] Dependencies installed

rem --- 3. Port: first free one at or above the requested port ----------------
set "WANT=%PORT%"
set "PORT="
rem stderr goes to nul so the child always has a valid handle and only the port is captured
for /f "usebackq delims=" %%p in (`node scripts\tooling\free-port.mjs %WANT% 2^>nul`) do set "PORT=%%p"
if not defined PORT (
  echo [x] No free port found from %WANT% upwards.
  goto fail
)
if not "%PORT%"=="%WANT%" echo [..] Port %WANT% is busy, using %PORT% instead.
echo [ok] Port %PORT%

rem --- 4. Production build (prod mode only) ----------------------------------
if /i "%MODE%"=="prod" (
  echo [..] Building for production ^(this takes a minute^)...
  call npm run build
  if errorlevel 1 (
    echo [x] The production build failed. Check the messages above.
    goto fail
  )
)

rem --- 5. Browser: opens by itself once the site answers -------------------
if "%OPEN%"=="1" start "" /b node scripts\tooling\open-when-ready.mjs %PORT%

rem --- 6. Server (Ctrl+C to stop) ------------------------------------------
echo.
echo   Starting on http://localhost:%PORT%   ^(Ctrl+C to stop^)
echo.
if /i "%MODE%"=="prod" (
  call npm run start -- --port %PORT%
) else (
  call npm run dev -- --port %PORT%
)
if errorlevel 1 goto fail
endlocal
exit /b 0

:help
echo.
echo   Usage: startup.bat [dev ^| prod] [port] [--no-open]
echo.
echo     dev         Development server with hot reload (default)
echo     prod        Production build, then the production server
echo     port        Port to use (default 3100; the next free one if busy)
echo     --no-open   Do not open the browser
echo.
endlocal
exit /b 0

:help_fail
echo   Usage: startup.bat [dev ^| prod] [port] [--no-open]   (startup.bat help for details)
:fail
echo.
echo   Something went wrong. Press any key to close this window.
pause >nul
endlocal
exit /b 1
