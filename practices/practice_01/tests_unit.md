# Unit-проверки

| Требование или правило | Что проверяем изолированно | Вход | Ожидаемый результат | Evidence |
|---|---|---|---|---|
| OUT-1 | Нормализация ответа ReviewService к OUT-1 | Ответ LLM: произвольный текст | Объект с полями summary, risks (<=3), checks | OUT-1 (CASE.md); app/review_service.py:22 сейчас возвращает {comment} |
| QA-1 | Отсечение лишних рисков и требование evidence | Список >3 рисков без file/line | Вернётся не более 3; каждый с file,line,evidence,risk | QA-1/OUT-1 (CASE.md) |
| SEC-1 | Редактирование секретов из diff | diff с `token=abc123`, `password=foo` | В prompt секреты заменены на [REDACTED] | SEC-1 (CASE.md); app/review_service.py:20-21 отправляет сырой diff |
| API-1 | Проверка длины diff на границе лимита | diff длиной 20000 и 20001 | 20000 проходит; 20001 отклоняется (413) | API-1 (CASE.md); в TRAINING_PR.diff проверки нет (api.py:35-37) |
| REL-1 | Таймаут вызова LLM | Медленный mock LLM (>10s) | Контролируемый OUT-1 (summary, risks, checks); исключение не уходит как HTTP 500 | REL-1 (CASE.md) |

## Как использовали AI

- Строка в [`prompts.md`](prompts.md): P1-03
- Что проверили и исправили сами: добавили unit API-1 на границе 20000/20001; уточнили REL-1 — контролируемый OUT-1 вместо «без исключения наружу».
