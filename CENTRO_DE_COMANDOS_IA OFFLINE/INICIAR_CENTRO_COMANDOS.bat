@echo off
setlocal
title Centro de Comandos IA Offline
set "APP_DIR=%~dp0"
set "HTML_FILE=%APP_DIR%SISTEMA_INTERNO\index.html"
set "PROFILE_ROOT=%LocalAppData%\MicroaplicacionesOffline\CentroComandosIA"
if not defined LocalAppData set "PROFILE_ROOT=%TEMP%\MicroaplicacionesOffline\CentroComandosIA"
set "PROFILE_DIR=%PROFILE_ROOT%\PerfilNavegador"

if not exist "%HTML_FILE%" goto :wrong_location
if not exist "%PROFILE_DIR%" mkdir "%PROFILE_DIR%" >nul 2>nul
if not exist "%PROFILE_DIR%" goto :profile_error

set "BROWSER_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if not defined BROWSER_EXE (
  echo No se encontro Edge ni Chrome en sus ubicaciones habituales.
  echo Se intentara abrir el HTML con el navegador predeterminado.
  start "" "%HTML_FILE%"
  if errorlevel 1 goto :browser_error
  endlocal
  exit /b 0
)

set "CCIA_HTML_FILE=%HTML_FILE%"
set "HTML_URL="
for /f "usebackq delims=" %%U in (`powershell -NoProfile -Command "$p=$env:CCIA_HTML_FILE; ([System.Uri]$p).AbsoluteUri"`) do set "HTML_URL=%%U"
if not defined HTML_URL goto :browser_error
start "" "%BROWSER_EXE%" --user-data-dir="%PROFILE_DIR%" --app="%HTML_URL%" --no-first-run
if errorlevel 1 goto :browser_error
endlocal
exit /b 0

:wrong_location
echo ERROR: Este iniciador debe permanecer dentro de la carpeta completa.
echo No copie el archivo BAT solo al Escritorio.
echo Mantenga la carpeta completa y vuelva a ejecutar INICIAR_CENTRO_COMANDOS.bat.
pause
exit /b 1

:browser_error
echo ERROR: No se pudo abrir el Centro de Comandos IA.
echo Compruebe los permisos de la carpeta y vuelva a intentarlo.
pause
exit /b 1

:profile_error
echo ERROR: No se pudo preparar el perfil local del navegador.
echo Compruebe los permisos de Windows y vuelva a intentarlo.
pause
exit /b 1
