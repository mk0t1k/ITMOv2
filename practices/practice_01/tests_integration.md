# Integration-проверки

| Связь компонентов | Что может сломаться | Как воспроизводим | Ожидаемый результат | Evidence |
|---|---|---|---|---|
| API -> ReviewService -> LLM | Нет формата OUT-1 | POST /api/reviews с корректным diff | HTTP 200 и OUT-1 (summary, risks<=3, checks) | TRAINING_PR.diff (api.py:35-37; review_service.py:20-22), OUT-1 (CASE.md) |
| API -> валидатор | Oversized diff не отклоняется | POST /api/reviews с diff длиной 20001 | HTTP 413 | API-1 (CASE.md) |
| API -> валидатор | Граничный diff отклоняется ошибочно | POST /api/reviews с diff длиной 20000 | HTTP 200 | API-1 (CASE.md) |
| Sanitize -> LLM | Секреты попадают в prompt | POST /api/reviews с diff, содержащим секрет | В prompt секреты заменены на [REDACTED] | SEC-1 (CASE.md); TO BE / adr.md — sanitizer не в TRAINING_PR.diff |
| API -> ReviewService -> logs | В лог попадает diff или ответ LLM | POST /api/reviews с корректным diff | В логах только request_id, duration, status (OBS-1) | OBS-1 (CASE.md); adr.md |

## Как использовали AI

- Строка в [`prompts.md`](prompts.md): P1-03
- Что проверили и исправили сами: убрали дубль REL-1 (остался в unit/e2e); добавили OBS-1 и границу API-1 (20000); пометили Sanitize как TO BE.
