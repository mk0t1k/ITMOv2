# Chain of Verification

- Проверяемый черновик или утверждение: `tests_load.md` — 10 RPS, p95<500ms, error rate<1%, evidence API-1/REL-1, oversized 2 RPS, плюс «нагрузка пока не нужна»

## Запрос на проверку

```text
CoVe. Сначала таблица вопросов, потом целый исправленный tests_load.md.
Источники: CASE.md, tests_integration.md, tests_e2e.md.
1. Есть ли в CASE.md RPS, p95, error rate 1%?
2. API-1 — latency или только 413?
3. REL-1 — p95 или timeout 10с?
4. Одиночный 413 уже в integration/e2e?
5. Таблица противоречит «пока не нужно»?
Новый SLA не добавляй. Структуру файла сохрани.
```

## Вопросы проверки и evidence

| Вопрос | Источник или проверка | Результат |
|---|---|---|
| Есть ли в CASE.md RPS, p95, error rate 1%? | CASE.md, правила репозитория | Нет |
| API-1 — latency или 413? | CASE.md, API-1 | Только diff > 20000 → HTTP 413 |
| REL-1 — p95 или timeout 10с? | CASE.md, REL-1 | Timeout 10с, контролируемый ответ |
| Одиночный 413 уже в integration/e2e? | tests_integration.md, tests_e2e.md | Да |
| Таблица противоречит «пока не нужно»? | tests_load.md | Да: 10 RPS при абзаце «нагрузка не нужна» |

## Исправленный результат

Модель оставила 10 RPS как профиль без порога, oversized 413 и добавила REL-1 под 2 RPS.
[`tests_load.md`](tests_load.md)
https://opncd.ai/share/1kkFh8zP

## Что изменили в исходном артефакте

- Файл и раздел: [`chain_of_verification/tests_load.md`](tests_load.md), таблица
- Изменение: сняли p95 < 500ms и error rate < 1%; добавили сценарий timeout LLM
- Что отклонили: 10 RPS и 2 RPS без источника; oversized 413 как нагрузку (дубль integration/e2e). В практику 1 это не переносим

Скрытые рассуждения модели не сохраняйте; нужны только вопросы, evidence и исправленный результат.
