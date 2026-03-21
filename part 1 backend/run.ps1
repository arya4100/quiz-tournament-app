$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$env:JAVA_HOME = "$ScriptDir\jdk-17.0.2"
$env:Path = "$ScriptDir\apache-maven-3.9.6\bin;$env:JAVA_HOME\bin;$env:Path"
mvn spring-boot:run
