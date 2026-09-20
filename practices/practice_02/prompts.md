# Журнал экспериментов Практики 2

- Выбранный слабый артефакт Практики 1: [`tests_load.md`](../practice_01/tests_load.md)
- Что в нём нужно улучшить:
  таблица задаёт 10 RPS, p95 < 500ms и error rate < 1% со ссылкой на API-1/REL-1, хотя в CASE.md нет SLA по RPS и latency; сценарий oversized diff дублирует integration/e2e, а не проверяет нагрузку; ниже по тексту нагрузка объявлена пока ненужной. Нужно либо честно отложить нагрузку до появления SLA, либо оставить только сценарии, выводимые из CASE.md (отказ 413 под конкуренцией, контролируемый timeout REL-1 под параллельными LLM-вызовами) с воспроизводимым способом замера.
- Как поймём, что изменение полезно:
  в файле не останется чисел без источника; evidence будет указывать на конкретное правило, а не на выдуманный SLA; сценарии не будут дублировать tests_integration.md / tests_e2e.md; по тексту будет однозначно: нагрузка отложена (с условием запуска) либо есть проверяемый предел. Другой человек сможет воспроизвести замер без устных пояснений.

| Техника | Файл эксперимента | Изменённый файл Практики 1 | Конкретное изменение | Проверка | Что отклонили |
|---|---|---|---|---|---|
| Few-shot | [`few_shot/experiment.md`](few_shot/experiment.md) | [`few_shot/tests_load.md`](few_shot/tests_load.md) | таблица: конкурентные API-1 и REL-1 вместо 10 RPS | CASE.md не содержит RPS/p95 | max in-flight |
| R.C.T.F. | [`rctf/experiment.md`](rctf/experiment.md) | [`rctf/tests_load.md`](rctf/tests_load.md) | таблица: конкурентные API-1 и REL-1 вместо 10 RPS| integration/e2e | новые ## |
| Chain of Verification | [`chain_of_verification/experiment.md`](chain_of_verification/experiment.md) | [`chain_of_verification/tests_load.md`](chain_of_verification/tests_load.md) | сняты p95 и 1%; добавлен timeout | таблица вопросов vs CASE.md | 10 RPS, oversized как load |
| Tree of Thoughts | [`tree_of_thoughts/experiment.md`](tree_of_thoughts/experiment.md) | [`tree_of_thoughts/tests_load.md`](tree_of_thoughts/tests_load.md) | выбрано C, одна конкурентная строка | критерии 1–3 | A, B, 5 RPS |
| RAG | [`rag/experiment.md`](rag/experiment.md) | [`rag/tests_load.md`](rag/tests_load.md) | Evidence из CASE/diff/тестов, без RPS | цитаты источников | 10 RPS, p95, 1% |
| ReAct | [`react/experiment.md`](react/experiment.md) | [`react/tests_load.md`](react/tests_load.md) | одна серия без порогов, дубль 413 убран | шаги READ/COMPARE | выдуманный SLA |

