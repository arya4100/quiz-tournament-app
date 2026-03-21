@echo off
set "BASEDIR=c:\Users\aryap\Desktop\final project\part 1 backend"
set "JAVA_HOME=%BASEDIR%\jdk-17.0.2"
set "PATH=%BASEDIR%\apache-maven-3.9.6\bin;%JAVA_HOME%\bin;%PATH%"
cd /d "%BASEDIR%"
echo Compiling...
mvn compile 2>&1
echo.
echo Compile done.
