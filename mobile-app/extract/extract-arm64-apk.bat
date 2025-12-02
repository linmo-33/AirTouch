@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo === Airtouch arm64 APK extractor (Windows) ===

:: 检查文件
if not exist credentials.json (
    echo Error: credentials.json not found!
    pause
    exit
)
if not exist keystore.jks (
    echo Error: keystore.jks not found!
    pause
    exit
)

:: 读取密码（使用 PowerShell + jq）
for /f %%p in ('powershell -command "jq -r .android.keystorePassword credentials.json"') do set KEYSTORE_PASS=%%p
for /f %%a in ('powershell -command "jq -r .android.keyAlias credentials.json"') do set KEY_ALIAS=%%a
for /f %%k in ('powershell -command "jq -r .android.keyPassword credentials.json"') do set KEY_PASS=%%k

echo Using alias: %KEY_ALIAS%

:: 找 aab
set AAB_FILE=
for %%f in (*.aab) do set AAB_FILE=%%f
if "%AAB_FILE%"=="" (
    echo Error: No .aab file found!
    pause
    exit
)

:: 下载 bundletool
if not exist bundletool.jar (
    echo Downloading bundletool...
    powershell -Command "Invoke-WebRequest https://github.com/google/bundletool/releases/download/1.18.1/bundletool-all-1.18.1.jar -OutFile bundletool.jar"
)

:: 使用系统 java
java -jar bundletool.jar build-apks --bundle="%AAB_FILE%" --output=universal.apks --mode=universal --ks=keystore.jks --ks-key-alias=%KEY_ALIAS% --ks-pass=pass:%KEYSTORE_PASS% --key-pass=pass:%KEY_PASS%

:: 解压
powershell -Command "Expand-Archive -Force universal.apks -DestinationPath ."
del universal.apks
ren universal.apk Airtouch-arm64-%date:~-4%%date:~4,2%%date:~7,2%.apk

echo.
echo Success! Pure arm64 APK generated
echo Check the new .apk file in this folder
pause