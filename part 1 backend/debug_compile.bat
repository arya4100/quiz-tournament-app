@echo off
set "JAVA_HOME=C:\Users\aryap\.gemini\antigravity\scratch\quiz-tournament-api\jdk-17.0.2"
set "PATH=C:\Users\aryap\.gemini\antigravity\scratch\quiz-tournament-api\apache-maven-3.9.6\bin;%JAVA_HOME%\bin;%PATH%"
mvn clean compile > compile_debug_2.log 2>&1
