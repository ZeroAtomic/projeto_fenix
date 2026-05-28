@echo off
echo Iniciando Projeto Fenix Local-First...
start cmd /k "npm run dev"
timeout /t 5
start http://localhost:5173
exit
