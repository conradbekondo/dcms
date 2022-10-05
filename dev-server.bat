echo off
cls
set NODE_ENV=development
set SERVER_ONLY=true
yarn run start:debug
echo on