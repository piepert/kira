@echo off

if "%1" NEQ "" cd "%1"
cd static

echo. >> error_log.txt
echo --- [ Error log from: %DATE% %TIME% ] --- >> error_log.txt

REM Set PID to first argument
REM It is used to wait for KIRA to end, else patches can't be installed
set PID=%2
REM If PID is empty, just start KIRA
if "%PID%"=="" goto KIRA_START

:KIRA_CHECK
echo Waiting for old KIRA process to stop.
echo Waiting for old KIRA process to stop. >> error_log.txt

REM Search for given PID (of KIRA) in task list
tasklist /FI "PID eq %PID%" 2>NUL | find /I "%PID%">NUL
REM if the PID exists, wait for the programm to finish
if "%ERRORLEVEL%"=="1" ( goto KIRA_ENDED ) else (
    echo KIRA is running.
    timeout /T 1 /NOBREAK>NUL
    goto KIRA_CHECK
)

:KIRA_ENDED
echo Old KIRA process ended.
echo Old KIRA process ended. >> error_log.txt

:INSTALL_PATCH
echo Installing new Patch now...
echo Installing new Patch now...>>error_log.txt
rmdir ..\static_backup\translations /s /q
powershell -command "expand-archive -force patch.zip patch/"
powershell -command "copy-item patch/* -destination .. -force -recurse -verbose"

echo Load static backup...
echo Load static backup...>>error_log.txt
powershell -command "copy-item ../static_backup/* -destination ../static/ -force -recurse -verbose"
rmdir patch /s /q
npm install

:KIRA_START
node --trace-warnings ..\dist\KIRA.js 2>> error_log.txt
if "%ERRORLEVEL%"=="13" goto END

echo.
echo.
echo Program exited. Please do not close the window if there are any errors.

:LOOP
pause>NUL
goto LOOP

:END