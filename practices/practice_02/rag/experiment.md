# RAG

- Вопрос к источникам: какие пределы нагрузки можно утверждать по источникам, а какие в `tests_load.md` не подтверждены

## Разрешённые источники

| Файл или документ | Зачем нужен | Какой фрагмент используем |
|---|---|---|
| CASE.md | правила | API-1, REL-1 |
| TRAINING_PR.diff | API | POST /api/reviews |
| tests_integration.md / tests_e2e.md | что уже покрыто | 413, timeout |
| tests_load.md | черновик | 10 RPS, p95, 1% |

## Запрос

```text
Только перечисленные источники. Нет факта — не пиши.
Что в tests_load.md подтверждено? Что вычеркнуть (10 RPS, p95, 1%)?
Потом верни исправленный tests_load.md со ссылками в Evidence. Структура та же.
```

## Ответ со ссылками на источники

https://opncd.ai/share/dNrfJE0e

### Подтверждено

- API-1: diff > 20000 → 413 — CASE.md; одиночный кейс уже в tests_integration.md / tests_e2e.md
- REL-1: timeout 10с, не 500 — CASE.md; tests_e2e.md
- POST /api/reviews — TRAINING_PR.diff, api.py:35-37

### Не подтверждено

- 10 RPS, 5 минут, p95 < 500ms, error rate < 1%

## Что изменили в исходном артефакте

- Файл и раздел: [`rag/tests_load.md`](tests_load.md), таблица и Evidence
- Изменение: две серии без RPS (timeout LLM и oversized 413); в Evidence — CASE.md, diff, integration/e2e
- Как проверили ссылки: правила есть в CASE.md; 413/timeout есть в test-файлах; RPS/p95 там нет
- Что отклонили как неподтверждённое: 10 RPS, p95, 1%. Слабое место копии: «серии запросов» без того, чем это отличается от одиночного e2e
