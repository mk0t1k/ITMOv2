#!/usr/bin/env sh
set -e

echo "=== 1. Проверка типов TypeScript ==="
npm run typecheck || npx vue-tsc --noEmit

echo "=== 2. Линтинг ==="
npm run lint

echo "=== 3. Сборка продакшн бандла ==="
npm run build

echo "=== 4. Запуск юнит-тестов ==="
npm test

echo " Все проверки успешно пройдены!"