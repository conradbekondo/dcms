echo off
cls
set NODE_ENV=development
npx lerna run dev --stream
echo on