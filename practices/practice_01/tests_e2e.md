# E2E-проверки

| Сценарий пользователя | Предусловия | Действие | Наблюдаемый результат | Evidence |
|---|---|---|---|---|
| Позитивный OUT-1 и SEC-1 | Сервис запущен; mock LLM с перехватом prompt | POST /api/reviews с diff, содержащим `token=...` | HTTP 200, OUT-1 (summary, risks<=3, checks); в prompt mock LLM секрет заменён на [REDACTED] | OUT-1, SEC-1, QA-1 (CASE.md); TRAINING_PR.diff |
| Негативный oversized diff | Сервис запущен | POST /api/reviews с diff длиной 20001 | HTTP 413 | API-1 (CASE.md) |
| Граничный таймаут LLM | Сервис запущен; mock LLM зависает >10s | POST /api/reviews с корректным diff | HTTP 200, JSON в формате OUT-1; не HTTP 500 | REL-1 (CASE.md) |

## Как использовали AI

- Строка в [`prompts.md`](prompts.md): P1-03
- Что проверили и исправили сами: добавили SEC-1 в позитивный e2e; уточнили REL-1 — OUT-1 и не 500 вместо «контролируемый ответ без 500».
