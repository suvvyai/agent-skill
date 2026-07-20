---
name: suvvy-mcp
description: Use when managing the Suvvy bot platform — creating or configuring bots, knowledge bases (FAQ Documents, Big Documents), channels, custom tools, or writing and reviewing bot system prompts via the Suvvy MCP server.
compatibility: Requires the Suvvy MCP server to be configured and authenticated. See https://docs.suvvy.ai for setup instructions.
---

# Suvvy MCP

## Overview

Suvvy is a platform for creating LLM-powered chatbots (**Bots**) that connect to messaging channels and communicate with clients. Each bot has a system prompt, a knowledge base, channel integrations, and optional custom tools (actions).

**Requirement:** All Suvvy management is done through the **Suvvy MCP server**. If it is not configured in your environment, refer to the documentation: `https://docs.suvvy.ai`

> Throughout this skill, "see MCP" or "available via MCP" means: consult the relevant MCP tool schema directly — tool descriptions and argument definitions are the authoritative source for full parameter details.

**Using references:** Whenever any feature is mentioned — even in passing — immediately load the relevant `references/` file before continuing. When in doubt, load it. Do not rely on the summary in the main file alone.

## Plan First, Build Second

**Before creating or significantly modifying a bot, always plan first — never make API calls without a confirmed plan.**

When the user asks to build or configure a bot, do not start executing immediately. Instead:

1. **Draft a complete plan** using the template below
2. **Present the plan to the user** — explain the reasoning behind each architectural choice
3. **Get explicit approval** — wait for the user to confirm or adjust the plan
4. **Only then execute** — follow the approved plan step by step

This applies to building a new bot, adding a major feature, restructuring the knowledge base, or any change that involves multiple interconnected decisions.

**Plan template:**

```
**Bot plan:**
- **Role:** [what the bot does and for what company]
- **Knowledge Base:** [FAQ Documents / Big Documents / Tables — list what will be created]
- **Custom Tools:** [actions/webhooks needed — list with purpose]
- **Bot Settings:** [key settings to configure]
- **Dialogue Flow:** [step-by-step interaction logic]
- **Channels:** [where the bot will operate — note: configured manually in dashboard]
```

## Communicating with Users

**The target audience is non-technical users.** They do not know how the platform works internally — and they don't need to. Your job is to speak in terms of outcomes, not mechanics.

### What to never expose (unless the user explicitly asks)

**Function and parameter names** — the user should never see these:
- ❌ "Я вызову `create_faq_document` с параметром `title_for_search`…"
- ❌ "Обновлю `llm_settings.temperature_mode` на `stability`"
- ❌ "Установлю `history_type: last_messages`"

**Internal object IDs** — keep them behind the scenes:
- ❌ "ID бота: `a1b2c3d4-...`"
- ❌ "instance_id вашего бота — `xyz`"

### How to communicate instead

Describe what will happen, not what API call you're making:

| Instead of this | Say this |
|---|---|
| "Вызову `create_instance` для создания бота" | "Создаю бота" |
| "Установлю `history_type: last_messages`" | "Настрою бота так, чтобы он помнил только последние N сообщений" |
| "Обновлю `llm_settings.temperature_mode: stability`" | "Сделаю ответы бота стабильными и предсказуемыми" |
| "Создам `faq_document` с `title_for_search`" | "Добавлю в базу знаний документ о…" |
| "Добавлю шаг типа `webhook` в Custom Tool" | "Настрою обращение к вашему API при…" |

### Когда ID всё же нужны

Предоставляйте ID только если:
- Пользователь явно спрашивает ("какой ID у моего бота?")
- ID нужен для ручной настройки в другой системе

В остальных случаях — держите техническую механику за кадром.

### Названия моделей — только из актуального списка

Никогда не называйте модели по внутренним кодам (`llm_code`) и не используйте названия из памяти — они могут устареть. Перед тем как упомянуть модель пользователю:

1. Вызовите `get_llm_list`, чтобы получить актуальный список доступных моделей.
2. Используйте человекочитаемое название из ответа, а не внутренний код.

❌ "Выберите модель: `claude-sonnet-4-6` или `gpt-4o`"
✅ "Выберите модель: Claude Sonnet или GPT-4o"

### Цены и баланс — только в валюте, не в токенах

Никогда не показывайте пользователю суммы в токенах. Всегда конвертируйте в валюту:

1. Вызовите `get_balance_token_rates`, чтобы получить курс токенов для каждой модели.
2. Пересчитайте токены в деньги.
3. Покажите пользователю только итоговую сумму в валюте (например, "~3,2 ₽ за диалог").

❌ "Стоимость диалога — 1 200 токенов"
✅ "Стоимость диалога — около 1,8 ₽"

## Terminology

| Concept | Primary Term | Code / MCP Term | Russian | Aliases / Abbreviations |
|---|---|---|---|---|
| Main entity | **Bot** | `instance` | Бот, Агент | Agent |
| Knowledge base | **Knowledge Base** | — | База знаний | БЗ |
| Knowledge base entry (direct) | **FAQ Document** | `faq_document` | Прямой вопрос | Direct Question, ПВ |
| Knowledge base entry (semantic) | **Big Document** | `big_document` | Большой файл | Large File, БФ |
| Knowledge base entry (structured) | **Table** | `table` | Таблица | — |
| Callable action | **Custom Tool** | `custom_tool` | Кастомное действие, Действие, Воркфлоу | Action, Workflow, КД |
| Communication surface | **Channel** | `channel` | Канал | — |
| Pre-built connector | **Integration** | `integration` | Интеграция | — |
| Client chat session | **Dialog** | `dialog` | Диалог | Dialogue |
| Sub-agent bot | **Subordinate Bot** | — | Подчиненный бот | Slave bot |
| Multi-agent architecture | **Multi-agent System** | — | Мультиагентная система | — |
| Scheduled outbound message | **Follow-Up** | — | Фоллоу Ап, Отложенное сообщение | Ping, Scheduled Message |
| Instruction template engine | **Templates** | `use_liquid` | Шаблоны в инструкции | — |
| Dialog-scoped named field | **Custom Variable** | `custom_variable` | Пользовательская переменная, Поле диалога | Dialog field |
| Bot-defined dialog memory | **Memory** | — | Память | Dynamic Variables |
| KB analytics label | **Knowledge Tag** | `knowledge_tag` | Тег | Tag |
| File attached to FAQ Document for delivery | **File to Send** | `file_to_send` | Файл для отправки | — |
| Image attached to FAQ Document for visual search | **Image** | `image` | Картинка | — |

> In MCP tool names and API parameters, always use the code/MCP term (e.g., `instance_id`, `faq_document`).

## Core Concepts

### Bots (Instances)

A bot is the central entity on the platform. **Always create bots without a template** — start from a blank configuration and build up from scratch.

Each bot has:
- A **system prompt** (also called **Instruction**) — defines behavior, tone, and dialogue logic
- A **knowledge base** — FAQ Documents, Big Documents, and/or Tables
- **Channels** — where clients interact (messengers, chat widgets, etc.)
- **Integrations** — pre-built connectors available on the platform; when attached to a bot, they add tools that let the bot interact with external applications (CRMs, booking systems, etc.)
- **Custom Tools** — optional callable actions

### Key Bot Settings

All bot settings are updated via `update_instance`. Setting groups: LLM & Generation, Dialogue History, Image Handling, Message Filtering & Working Hours, Employee Interception, Response Formatting, Notifications & Alerts, RAG / Vector Search, Knowledge Base Options, Security & Compliance, Cost & Performance, Channels & Integrations, Organization & Multi-profile.

> Load `references/bot-settings.md` when configuring bot settings via `update_instance`.

### Functions

Every bot has a unified list of callable functions. The bot can call any function from this list in accordance with its instruction. Functions come from four sources:

- **Knowledge base** — `get_file_text` (FAQ Documents), `search_in_knowledge_base` (Big Documents), and per-table functions (Tables)
- **Custom Tools** — manually configured actions
- **Channels** — some channel integrations expose their own functions
- **Integrations** — pre-built connectors add their own functions (CRM, booking, etc.)

Use `get_instance_functions` to retrieve the complete list of all callable functions currently available to a specific bot — useful when writing or auditing the instruction to ensure all referenced functions actually exist.

### Knowledge Base

Suvvy supports three knowledge base types that can run simultaneously on the same bot.

**KB-level option — Keywords:** When enabled, specific keywords can be defined on the bot. If a client's message contains one of these keywords, the bot is required to call at least one knowledge base function before responding. Use to ensure the bot always consults the KB for certain topics rather than answering from the instruction alone.

> Load `references/kb-faq-documents.md` when creating or editing FAQ Documents.
> Load `references/kb-big-documents.md` when importing or configuring Big Documents.
> Load `references/kb-tables.md` when working with Tables or SQL queries.
> Load `references/kb-tags.md` when configuring Knowledge Tags for analytics.

### Custom Tools

Custom Tools extend a bot's capabilities with arbitrary logic. Each consists of one or more sequential Steps that can pass data to each other via variables. Step types include webhooks, bot calls, table queries, CRM actions, payment links, image generation, and more.

> Load `references/custom-tools.md` when creating or configuring Custom Tools.

### Integrations

Integrations are pre-built connectors that can be attached to a bot. Unlike Custom Tools (manually configured), Integrations are ready-made — once connected, they add tools that let the bot interact with external applications (CRMs, booking platforms).

Examples of what integration tools enable: schedule a client appointment, look up a client record, create or update a CRM entry.

When writing a bot's system prompt, treat integration tools the same as custom tools: define an explicit trigger condition for each call.

### Dialogs

A Dialog is the chat session between a bot and a client. When a client writes to a connected channel, a dialog is created. Client messages arrive in the dialog, the bot responds (calling functions as needed), and its replies are sent back through the channel.

The active bot in a dialog can be switched mid-conversation via a Custom Tool step. The new bot takes over and does not need to have that channel connected.

**Pause / Resume bot** — use `pause_or_resume_instance_in_dialogue_by_id` to manually pause or resume the bot in a specific live dialogue.

**Answer as employee** — use `answer_in_dialogue_as_an_employee` to send a message into a live dialogue as an employee. The end client sees it as a normal message.

**Clear dialogue context** — use `clear_dialogue_context_by_id` to reset the context of a specific dialogue (applies to real dialogues, not just the test chat).

**Search dialogues** — use `search_dialogues_by_message_filter` to find real dialogues by message text and other filters.

**Reading dialogue data** — `get_dialogue_list` lists all real dialogues for a bot; `get_dialogue_by_id` retrieves a specific dialogue; `get_dialogue_messages_by_dialogue_id` fetches the full message history.

**Dialogue ratings** — when a bot uses the `request_dialogue_rate` Custom Tool step, it generates a rating link. Use `get_dialogue_rate_list` to fetch all ratings, or `get_dialogue_rate_list_by_dialogue_id` for a specific dialogue.

**Active Follow-Ups in a dialogue** — use `get_active_reminder_list_by_dialogue_id` and `get_scheduled_messages_for_dialogue_by_dialogue_id` to inspect pending Follow-Ups. Use `cancel_reminders_in_dialogue` to cancel them.

### Subordinate Bots

A Subordinate Bot is a bot invoked from a Custom Tool step and runs within a single function call. The flow:

1. The active bot triggers a Custom Tool
2. A step in that tool calls the Subordinate Bot, passing it relevant information
3. The Subordinate Bot processes the request — calling its own functions, integrations, etc.
4. Its response is returned to the calling bot as the function result

Subordinate Bots are configured exactly like regular bots but have no channel attached. Their instruction should be written as a technical/internal agent prompt. Useful for delegating specialized tasks and keeping each bot focused on a narrow responsibility.

### Follow-Ups

Follow-Ups are messages scheduled to be sent to a client at a future time. Three types: **Follow-Ups** (from Custom Tool steps or FAQ/Big Document retrieval), **Dynamic Follow-ups** (timed relative to a client-specific event date), and **Scheduled Event Groups** (bot-level, triggered by dialogue inactivity).

> Load `references/follow-ups.md` when setting up any type of follow-up or scheduled message.

### Custom Variables (Dialog Fields)

Custom Variables are named fields that persist for the entire duration of a dialog.

- Set by the bot directly or by a Custom Tool step
- Survive bot switches, multiple turns, Custom Tool calls
- Useful for storing client data collected during conversation (e.g., phone number, chosen product, lead stage)
- The predefined list of variable names is configured in advance; the bot assigns values to those names
- **Typed**: each variable has a type — `string`, `integer`, `number`, `boolean`
- **`show_to_bot`**: whether this variable is included in the bot's context (default: true). Set to false to hide internal variables from the LLM.
- **`is_writeable_by_bot`**: whether the bot can set this variable directly (default: true). Set to false to make it read-only for the bot.

### Memory (Dynamic Variables)

Memory works the same as Custom Variables but without a predefined list of field names. The bot sets key-value pairs freely — it decides both the key name and the value. Like Custom Variables, memory entries persist for the entire dialog.

- **Must be explicitly enabled** in bot settings (`memory.is_enabled = true`); disabled by default — `set_memory` steps will not work until this is turned on
- Use when the set of fields cannot be known in advance or varies per conversation
- Optional: `clear_with_context` — clears memory entries when the dialogue context is reset

### Standard Functions

Built-in callable functions: **Stop dialogue**, **Ignore message**, **Set dialogue tag**, **Call manager**. Enabled via `update_instance`. Add explicit trigger conditions in the instruction so the bot knows when to call each one.

> Load `references/standard-functions.md` when enabling Standard Functions or configuring reminder/schedule settings.

### Common Bot Archetypes

Suvvy bots are used in many roles — the platform imposes no restrictions on use case. Common examples:

| Archetype | What the bot does |
|---|---|
| **Support agent** | Answers product questions, resolves issues, escalates to a human |
| **Admin / Receptionist** | Books appointments, checks availability, manages schedules |

Any role that involves text-based client interaction is a valid use case.

### Voice Agent

Suvvy supports a **Voice Agent** mode for phone call interactions (STT → LLM → TTS). Cost: ~30 rubles per minute.

> Load `references/voice-agent.md` when configuring Voice Agent mode.

### Broadcasts (Рассылки)

Broadcasts send outbound messages to existing dialogue participants based on filters. They operate through channels already connected to the bot.

**Audience filters:** last message time window, Custom Variable values, specific channel, dialogue tags.

**Send parameters:** scheduled date/time, random delay range between sends (to avoid spam detection), message content (manual text or LLM-generated).

**Preview:** before confirming, the platform shows the count of matching dialogues.

> Broadcasts are **not configurable via MCP**. Set them up in the Suvvy dashboard (Рассылки tab).

### Переключение пользователей (User Switching)

Интеграторы (пользователи с подпиской интегратора) могут подключать других пользователей через реферальную ссылку. По умолчанию агент работает из-под профиля интегратора, но пользователь может попросить агента переключиться и работать из-под одного из подключённых им пользователей.

**Как переключиться:**

1. Пользователь называет почту или название компании нужного аккаунта.
2. Агент вызывает `get_user_list`, передавая почту или название компании в качестве фильтра. **Страницы нумеруются с нуля: первая страница — `page: 0`.**
3. Агент находит нужного пользователя в ответе и запоминает его `_id`.
4. Во всех последующих MCP-запросах агент передаёт этот `_id` в опциональном параметре `active_user_id`.
5. Если при вызове любого тула с `active_user_id` возвращается ошибка `AUTH_PARTNER_ACCESS_FORBIDDEN` — интегратору нужно вручную зайти в личный кабинет Suvvy и переключиться в аккаунт этого пользователя, введя его пароль. После этого можно вернуться к агенту и продолжить работу от имени этого пользователя.

Пока `active_user_id` передаётся, все действия выполняются от имени указанного пользователя. Чтобы вернуться к профилю интегратора — перестать передавать этот параметр.

## Writing Bot System Prompts

> Load `references/writing-prompts.md` when writing or reviewing a bot's system prompt, instruction variables, Templates (Шаблоны в инструкции), or FAQ Document content.

## Feature Selection Guide

Use this section during planning to choose the right tool for the job.

### Knowledge Base: which type to use?

| Situation | Use |
|---|---|
| Specific, predictable user intent with a clear answer | **FAQ Document** |
| Short structured answer, branching logic, or CRM event on retrieval | **FAQ Document** |
| Large unstructured content — manuals, policy docs, articles | **Big Document** |
| Content too large or varied to split into discrete intents | **Big Document** |
| Structured reference data — price lists, catalogs, schedules | **Table** |
| Bot needs to query specific rows by value | **Table** |
| Bot hallucinates on a topic it must not answer, despite a restriction | **FAQ Document** (decoy / подменный прямой вопрос) |

When in doubt between FAQ and Big Document: if you can write a clear 2–4 word title that captures the intent, it's an FAQ Document. If you can't, it's a Big Document.

### Custom Tools vs Integrations

| Situation | Use |
|---|---|
| External API call, webhook, or custom multi-step workflow | **Custom Tool** |
| Payment, image generation, keyboard, CRM write operation | **Custom Tool** (via dedicated step type) |
| Platform has a native pre-built connector (amoCRM, Bitrix, booking) | **Integration** |
| Need to write to CRM on a simple trigger without custom logic | **Integration** |

### Custom Variables vs Memory

| Situation | Use |
|---|---|
| Known fields in advance (client name, phone, chosen product) | **Custom Variables** |
| Field names are dynamic or vary per conversation | **Memory** (must be enabled in bot settings) |

### When to use auto-trigger (trigger_settings)

Use auto-trigger when the tool should fire **without the bot deciding** — e.g., log every new dialogue to CRM (`new_dialogue`), or run a check after every bot response (`new_instance_response`). If the bot should decide when to call the tool based on conversation context, use a normal (non-triggered) Custom Tool.

### When to use Templates in the instruction (Шаблоны в инструкции)

Use Templates when a single bot serves **multiple channels or contexts** that need different instruction content — different product codes per marketplace, different tone per channel, different rules based on time or client data. For a single-channel bot with no context-dependent variation, plain instruction variables (`{variable}`) are sufficient.

### When to use Subordinate Bots / Multi-agent System

If the user mentions a **"multi-agent system"** (мультиагентная система), they mean an architecture built from Subordinate Bots and/or bot switching — there is no separate concept on the platform.

- **Subordinate Bot (`bot_call` step)** — the active bot calls another bot as a sub-agent within a single function call, gets its response, and continues the conversation. The client never sees the switch.
- **Bot switching (`change_active_bot` step)** — the active bot hands the dialogue over to a different bot entirely. Pass `null` as `instance_id` to return to the original bot.

Use a Subordinate Bot when a task is complex enough to benefit from a dedicated specialist prompt. Use bot switching when the entire conversation flow should transfer to a different bot.

## Bot Setup Workflow

### Getting Started

A good starting point is to create the bot (`create_instance`, always without a template), write a first version of the system prompt, and create the initial FAQ Documents for the most common intents. That's enough to run the first test. From there, the process is iterative — add Custom Tools, Custom Variables, Memory, adjust bot settings, and keep testing.

**Copying a bot** — use `create_instance` with `from_instance` (an existing bot's ID) to create a full copy including instruction, knowledge base, and settings.

**Auto-generation (dashboard only):** the platform can generate a draft instruction and/or FAQ Documents from a text description or website URL. Use for the initial draft, then always review and edit the result before testing.

### Test-Iterate Loop

Every change to the bot must be followed by a test. Core cycle:

```
Change something → Test → Identify issues → Fix → Reset test chat → Repeat
```

**Test session checklist:**
- [ ] Get current test dialogue: `get_latest_test_dialogue_for_instance_by_instance_id` → save `dialogue_id`
- [ ] Reset for clean session: `get_new_test_dialogue_for_instance_by_instance_id`
- [ ] Send client messages one at a time: `send_message_to_test_dialogue_by_id`
- [ ] Read responses, check for issues
- [ ] If issues found — fix config, reset from step 2, repeat
- [ ] Run each scenario multiple times — LLM responses are non-deterministic; a single passing run doesn't mean the bot is reliable

Always reset the test chat before starting a new scenario — stale context produces misleading results.

### How to Write Test Messages

Messages in the test chat are sent **from the client's perspective** (`message_sender: "customer"`). Act as a real client in a real scenario, sending messages one at a time exactly as a user would.

Example test sequence:
```
→ "Привет"
→ "Хочу узнать стоимость ваших услуг"
→ "А есть скидки для новых клиентов?"
→ "Хорошо, хочу записаться на консультацию"
```

Tips:
- Follow the intended dialogue scenario from start to finish, not just test one phrase in isolation
- Vary phrasing between runs — the bot must handle natural, imperfect language
- Use `fake_channel` to simulate a specific channel type (e.g., `telegram_bot`, `whatsapp`, `amocrm`) when channel-specific behaviour matters
- To test employee interception: send a message as `message_sender: "employee"` and verify the bot freezes
- **Mark message as debug** — use `mark_message_as_debug_in_test_dialogue` to "disable" a specific message in the test chat context. Useful when iterating on a long test session without resetting the entire chat.
- **Manual SQL query** — use `user_query_table` to manually run SQL queries against a Table directly, useful for verifying expected rows before wiring into a Custom Tool.

**Check response style, not just correctness.** A technically correct answer delivered in a cold or awkward way is still a problem.

### Diagnosing Issues

> Load `references/diagnosing-issues.md` when the bot behaves unexpectedly or a test fails.

## Analytics

The **Аналитика** tab in the dashboard tracks bot performance over configurable time periods:

| Metric | Description |
|---|---|
| Dialogue count | Total conversations in the period |
| Message breakdown | Total received / bot-handled / employee-handled |
| Average dialogue cost | Cost in rubles/credits |
| Automation rate | % of messages handled by bot without human |
| Tag distribution | Which Knowledge Tags appeared and how often |
| Function call counts | How often each function was called |

Two views: **Dialogs** (aggregate summary) and **Dialog logs** (per-message detail for each dialogue).

> Analytics are read-only and not accessible via MCP. Monitor via the Suvvy dashboard.

## Reviewing Existing System Prompts

When auditing a bot's prompt:
1. Check all instructions are non-contradictory and non-duplicated
2. Verify each section contains only appropriate content (no FAQ data in dialogue logic, no instructions in restrictions)
3. Confirm every function call has a trigger condition and uses correct format
4. Move factual/reference data found in the prompt to FAQ Documents
5. Ensure dialogue steps are sequential, one action per step, and logically linked

## Reducing Dialogue Costs

> Load `references/reducing-costs.md` when optimizing bot costs or the user asks about dialogue pricing.

## Uploading Files

> The MCP server cannot upload files directly. Load `references/uploading-files.md` when any operation requires a file upload (importing Big Documents, FAQ Documents, Tables, Files to Send, Images, or test chat attachments).

## Gotchas

| Mistake | Fix |
|---|---|
| Factual data (prices, addresses) in system prompt | Move to FAQ Documents |
| Function call without trigger condition | Add "If client asks/does X..." prefix |
| Using Big Documents for short structured answers | Use FAQ Documents instead |
| Multiple intents in one FAQ Document | One file = one intent |
| Generic FAQ Document titles | Use specific intent-based titles (2–4 words) |
| Calling `search_in_knowledge_base` for a known specific file | Use `get_file_text` with the exact title |
| Using `set_memory` steps without enabling memory in bot settings | Enable `memory.is_enabled: true` via `update_instance` first |
| `title` and `title_for_search` mismatch — bot sees wrong description | Set `title_for_search` to an intent-based phrase the bot will recognize |
| Creating bot from a platform template | Always create without a template — pass no arguments to `create_instance` or use `template_code: "default"` |
| Expecting `test_llm_code` model to affect live dialogues | `test_llm_code` only applies in the test chat |
| More than 10 function calls in a single dialogue turn | Simplify the scenario; delegate sub-tasks to Subordinate Bots |
| Contradictory instructions → bot calls the same function twice | Audit instruction for conflicting conditions; ensure each trigger is unique |
| Token overflow (context exceeds model limit) | Reduce `history_type` window, shorten instruction, split large FAQ Documents |
| Pagination starting at 1 | All paginated methods use **0-based page numbering** — the first page is `page: 0`, not `page: 1` |
