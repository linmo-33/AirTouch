@echo off
chcp 65001 >nul
echo ========================================
echo   AirTouch PC Controller - 打包工具
echo ========================================
echo.

REM 检测虚拟环境
set VENV_PYTHON=.venv\Scripts\python.exe
set VENV_PIP=.venv\Scripts\pip.exe
set VENV_PYINSTALLER=.venv\Scripts\pyinstaller.exe

if exist "%VENV_PYTHON%" (
    echo 检测到虚拟环境，使用: %VENV_PYTHON%
    set PYTHON_CMD=%VENV_PYTHON%
    set PIP_CMD=%VENV_PIP%
    set PYINSTALLER_CMD=%VENV_PYINSTALLER%
) else (
    echo 未检测到虚拟环境，使用系统 Python
    set PYTHON_CMD=python
    set PIP_CMD=pip
    set PYINSTALLER_CMD=pyinstaller
)

echo.
echo [1/4] 检查依赖...
"%PIP_CMD%" install -r requirements-dev.txt
if errorlevel 1 (
    echo 依赖安装失败！
    pause
    exit /b 1
)

echo.
echo [2/4] 清理旧文件...
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build
if exist "*.spec" del /q *.spec

echo.
echo [3/4] 开始打包...
"%PYINSTALLER_CMD%" --onefile --windowed ^
    --name "AirTouch" ^
    --icon "icon.ico" ^
    --add-data "icon.ico;." ^
    --hidden-import=PIL._tkinter_finder ^
    --collect-all qrcode ^
    --uac-admin ^
    --noconfirm ^
    pc_controller.py

if errorlevel 1 (
    echo 打包失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 清理临时文件...
if exist "build" rmdir /s /q build
if exist "*.spec" del /q *.spec

echo.
echo ========================================
echo   ✅ 打包完成！
echo   可执行文件: dist\AirTouch.exe
echo   文件大小: 
dir dist\AirTouch.exe | find "AirTouch.exe"
echo ========================================
echo.
echo 提示：
echo   - 双击 AirTouch.exe 即可运行
echo   - 首次运行可能需要允许防火墙访问
echo   - 可将 exe 文件复制到任意位置使用
echo ========================================
pause
