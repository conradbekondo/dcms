echo off
cls
set NODE_ENV=development
npx lerna run start:dev --stream
echo on