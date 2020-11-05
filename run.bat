@echo off
cd static
node --trace-warnings ..\dist\KIRA.js 2>> error_log.txt
echo.
echo.
echo Program exited. Please do not close the window if there are any errors.
:loop
pause
goto loop