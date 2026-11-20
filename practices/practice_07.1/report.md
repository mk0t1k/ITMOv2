# Отчет по практике 7.1: AI-ассистент для код-ревью в n8n

**Репозиторий:** `https://github.com/mk0t1k/SolarSystemModel`
**Тестовый Pull Request:** `https://github.com/mk0t1k/SolarSystemModel/pull/1` и `https://github.com/mk0t1k/SolarSystemModel/pull/2`

## 1. Реализованный функционал

В рамках практической работы и домашнего задания (включая пункт со звездочкой `*`) в n8n разработан автоматизированный сценарий код-ревью для GitHub Pull Requests:

1. **Фильтрация событий триггера и запуск по командам:**
   * В ноде `GitHub Trigger` настроено прослушивание события `issue_comment`.
   * Нода `If` отсекает лишние события, пропуская только новые комментарии (`action == "created"`), оставленные непосредственно в Pull Request (`issue.pull_request` существует).
   * Нода `Switch` проверяет текст комментария и запускает сценарий строго по командам `/make_ai_review` и `/make_other_ai_review`.

2. **Исключение дубликатов через Data Tables:**
   * Создана локальная таблица `reviewed_prs` с ключом `pr_id` формата `owner/repo#pr_number` (`mk0t1k/SolarSystemModel#<number>`).
   * Перед обращением к GitHub API и LLM выполняется поиск записи через ноду `Data Table (Get row(s))`.
   * Если запись уже существует (`If1 -> false`), сценарий не тратит токены на повторную генерацию, а оставляет в PR комментарий *«Ревью для этого PR уже проводилось ранее.»*.
   * После успешного ревью идентификатор PR записывается в таблицу через `Data Table (Insert row)`.

3. **Поддержка двух LLM-моделей:**
   * По команде `/make_ai_review` ревью выполняет первая модель (`google/gemini-3.8-flash` через `Code Review Agent1`).
   * По команде `/make_other_ai_review` ревью маршрутизируется на вторую модель (`openai/gpt-6-luna` через `Code Review Agent2`).

4. **Точечные инлайн-комментарии к блокам измененного кода (`*`):**
   * Через GitHub REST API (`/pulls/{number}` и `/pulls/{number}/files`) извлекаются `head.sha` последнего коммита и массив измененных файлов с их `patch`.
   * Нода `Code (Format Diff)` парсит unified diff и размечает строки новой версии файла тегами `[Line X]`, чтобы модель точно определяла координаты изменений.
   * LLM возвращает структурированный JSON со списком замечаний (`path`, `line`, `body`) и общим резюме (`summary`).
   * Нода `Code (Build Review Payload)` формирует валидный payload для GitHub Pull Request Reviews API (`POST /pulls/{number}/reviews`, `side: "RIGHT"`), после чего ревью публикуется построчно, а на PR вешается лейбл `ReviewedByAI`.

## 2. Результаты тестирования

* **Запуск `/make_ai_review`:** успешно сформированы и опубликованы точечные комментарии к измененным строкам кода, добавлен лейбл `ReviewedByAI`, запись сохранена в `reviewed_prs`.
* **Повторный вызов `/make_ai_review`:** сработала защита от дубликатов, в ленту PR отправлено уведомление о том, что ревью уже проводилось.
* **Запуск `/make_other_ai_review`:** успешно отработала вторая модель (`x-ai/grok-4.6`), опубликовав альтернативное ревью.

## 3. Скриншоты

* [Общий вид workflow](screenshots/workflow.png)
* [Настройка и запуск первого ревью](screenshots/pr1.png)
* [Результат альтернативного ревью](screenshots/pr2.png)
* [Результаты выполнений workflow](screenshots/executions.png)