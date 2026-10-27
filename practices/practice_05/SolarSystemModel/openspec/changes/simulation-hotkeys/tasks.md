# Tasks

## 1. Hotkeys Core & Helper

- [ ] 1.1 Создать модуль распознавания горячих клавиш `src/utils/simulationHotkeys.ts` с поддержкой `Space` (toggle play/pause) и `1-8` (выбор планет по порядку из PLANETS_DATA) с фильтрацией фокуса ввода.
- [ ] 1.2 Написать юнит-тесты в `tests/simulation_hotkeys.spec.ts` для проверки всех кейсов (Space, 1-8, неизвестные клавиши, игнорирование при фокусе в input) и проверить выполнение через `npm run test`.

## 2. Integration into UI & Viewport

- [ ] 2.1 Подключить слушатель событий клавиатуры в `src/components/CanvasViewport.vue` с вызовом `togglePlay` и `selectFromList`, гарантировав отписку в `onBeforeUnmount`.
- [ ] 2.2 Добавить визуальные подсказки хоткеев в интерфейс (`TimeControls.vue` — подсказка `[Space]` у кнопки паузы; `CanvasViewport.vue` — подсказки цифр `1-8` у планетных кнопок быстрого перехода).

## 3. Verification & Standards

- [ ] 3.1 Выполнить сквозную проверку качества и сборки через `sh scripts/check.sh` (включая линтинг, проверку типов `vue-tsc`, билд и юнит-тесты).

## Workflow follow-up

- Запустить `/opsx-apply` для реализации изменений.
- Заархивировать изменение после завершения и проверки.
