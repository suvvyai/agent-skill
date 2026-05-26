---
name: suvvy-mcp
description: Use when managing the Suvvy bot platform — creating or configuring bots, knowledge bases (FAQ Documents, Big Documents), channels, custom tools, or writing and reviewing bot system prompts via the Suvvy MCP server.
---

# Suvvy MCP

## Overview

Suvvy is a platform for creating LLM-powered chatbots (**Bots**) that connect to messaging channels and communicate with clients. Each bot has a system prompt, a knowledge base, channel integrations, and optional custom tools (actions).

**Requirement:** All Suvvy management is done through the **Suvvy MCP server**. If it is not configured in your environment, refer to the documentation: `https://docs.suvvy.ai`

> Throughout this skill, "see MCP" or "available via MCP" means: consult the relevant MCP tool schema directly — tool descriptions and argument definitions are the authoritative source for full parameter details.

## Plan First, Build Second

**Before creating or significantly modifying a bot, always plan first — never make API calls without a confirmed plan.**

When the user asks to build or configure a bot, do not start executing immediately. Instead:

1. **Draft a complete plan** — describe what the bot will do, what knowledge base structure to use, which Custom Tools are needed, what the dialogue flow looks like, which bot settings to configure, etc.
2. **Present the plan to the user** — explain the reasoning behind each architectural choice
3. **Get explicit approval** — wait for the user to confirm or adjust the plan
4. **Only then execute** — follow the approved plan step by step

This applies to building a new bot, adding a major feature, restructuring the knowledge base, or any change that involves multiple interconnected decisions.

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
| Knowledge base | **Knowledge Base** | — | База знаний | KB, БЗ |
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

All bot settings are updated via `update_instance`. The most important ones, grouped by concern:

#### LLM & Generation

- `llm_code` — model used in production; `test_llm_code` — model used only in the test chat (does not affect live dialogues)
- `llm_settings.reasoning_effort` — reasoning depth: `minimal` / `low` / `medium` / `high`
- `llm_settings.web_search` — enable internet search (configure `country` and optionally `allowed_domains`)
- Use `get_llm_list` to fetch the current list of available models before setting `llm_code` or `test_llm_code`.
- `set_default_llm` — shortcut to pick a model automatically: `price` (cheapest available) or `quality` (highest quality available). Use instead of specifying `llm_code` directly.
- `randomness` — response randomness (integer 0–100): `0` = most deterministic, `10` = balanced, `20` = creative. Low values = consistent factual answers; high values = more varied phrasing. The UI shows this as Стабильность / Сбалансированность / Креативность.
- `llm_settings.verbosity` — response length: `low`, `medium`, `high`. Use `low` for support bots and marketplaces, `high` for detailed explanations.
- `parallel_tool_call_limit` — functions callable simultaneously per turn (default: 10). Hard limit: **10 function calls per single dialogue turn** — scenarios requiring more will fail with an error.

#### Dialogue History

`history_type` controls how much context is passed to the LLM each turn:

| Value | Behavior |
|---|---|
| `enabled` | Full history |
| `disabled` | No history |
| `last_time` | Last N minutes — set duration via `history_time_minutes` |
| `last_messages` | Last N messages — set count via `history_last_messages_first_index` |

- `add_datetime_system_messages` — automatically prepend current date and time to every system message. Useful when the bot needs to be aware of the current time without explicit `{current_datetime}` in the instruction.

#### Image Handling

- `image_description_mode`:
  - `disabled` — images from clients are ignored
  - `vision` — LLM sees the image directly (requires a vision-capable model)
  - `if_not_found_in_knowledge_base` — first tries to match the image to an FAQ Document; if no match, a helper model describes the image and passes the text to the bot; use for models without native vision support
  - `always` — always describe images with a helper model regardless of KB match
- `image_description_instruction` — custom instruction (up to 1024 chars) passed to the helper model when describing client images. Use to focus on domain-specific attributes (e.g., "describe the product name and defect type").
- `image_search_threshold` — similarity threshold (0–20) for visual search matching in FAQ Documents. Lower = more permissive; higher = stricter. Tune if the bot incorrectly matches or misses image-triggered FAQ Documents.

#### Message Filtering & Working Hours

- `work_days` — per-day time ranges when the bot responds; silent outside configured hours. Format per day: `["HH:MM:SS-HH:MM:SS"]`. Also set `timezone` (offset from UTC, e.g. `3` for Moscow) so work hours are evaluated in the correct timezone.
- `ignore_customer_patterns` / `ignore_employee_patterns` — regex patterns; matching messages are silently skipped by the bot. Each entry: `pattern`, `can_be_part_of_word`, `dont_add_message` (if true, the message is also excluded from dialogue history — not just ignored by the bot).
- `stop_dialogue_patterns` — if a client message matches, the bot stops responding in this dialogue until resumed.
- `resume_customer_dialogue_patterns` / `resume_employee_dialogue_patterns` — patterns that re-activate a stopped bot.

#### Employee Interception

- `interception_by_employee` — when a manager writes in the same channel chat (WhatsApp, Telegram, etc.), the system detects it and freezes the bot so the human can handle the conversation directly.
- `ignored_employee_messages_count` — number of first messages from the employee to ignore before triggering interception (avoids reacting to internal notes or system messages).
- `sleep_time_minutes` — auto-resume: after this many minutes of employee inactivity, the bot automatically regains control of the dialogue. Set to `-1` to disable auto-resume.
- **Additional interception conditions**: beyond the basic toggle, the bot can be configured to:
  - Not reply to the specific message that triggered the interception (without stopping the whole dialogue)
  - Specify phrases that will not trigger interception (`resume_employee_dialogue_patterns` / `resume_customer_dialogue_patterns`)

#### Response Formatting

- `structured_answer` — in default mode (no custom JSON schema): bot can send images/files by writing a direct URL, and can split one response into multiple sequential messages. Set `chat_instruction` (up to 1000 chars) to give the bot additional formatting guidance in this mode. Custom `json_schema` mode makes the bot always return a raw JSON object.
- `answer_split` — how the bot splits its response into multiple sequential messages. Rules: `do_not_split`, `by_paragraphs`, `by_paragraphs3`, `by_lines`, `by_sentences`, `by_words`, `by_symbols`, `by_symbols_nearest_word`, `by_symbols_nearest_sentence`, `by_symbols_nearest_line`, `by_tokens_nearest_word`, `by_tokens_nearest_sentence`, `by_tokens_nearest_line`, `by_markdown_sections`, `by_markdown_sections_paragraphs` (default), `by_markdown_sections_paragraphs3`. Also configure `chunk_size` (max tokens per chunk). Use with `structured_answer` enabled.
- `send_message_sleep_seconds` — static delay in seconds (0–60) between each sequential message chunk. Use to simulate typing pauses.
- `send_message_dynamic_sleep` — enable dynamic delay between chunks based on chunk length (longer chunks = longer pause). Overrides static delay for text chunks; media chunks still use static delay.
- `message_header` / `message_footer` — static text automatically prepended or appended to every bot reply. Use for disclaimers, footers, or branding lines.
- `starting_message_list` — up to 10 suggestion buttons shown at dialogue start (each with `title` and `text`). When clicked, the button's text is sent as the client's first message. Useful for website widgets and Telegram bots.
- `replacement_patterns` (word replacements) — find/replace pairs applied to all bot responses. Each entry: `pattern`, `replacement`, `can_be_part_of_word` (default false). Use to standardize terminology or suppress unwanted phrases.
- `fallback_message` — static reply sent when the bot cannot process a message (e.g., unsupported file type received).

#### Notifications & Alerts

- **`notify_on_call` / `notify_if_called`** (on Custom Tools and FAQ Documents): sends a notification to the manager's Telegram or Messenger MAX when the tool or document is triggered. Use to alert a human when a sensitive topic comes up.
- **`refuse_on_call` / `refuse_if_called`** (on Custom Tools and FAQ Documents): bot skips the reply for the specific triggering message. Dialogue continues normally on subsequent messages. On FAQ Documents, setting an empty text body (`""`) achieves the same silent-retrieval effect.
- `notification_settings` — configure Telegram or Messenger MAX notification templates for bot events. Set `summary_instruction` (LLM prompt describing what to extract from the dialogue as a summary) and `document_used_template` (template for the notification sent when an FAQ Document is triggered). Template variables: `{bot}` (bot name), `{source}` (client identifier), `{document}` (triggered document name), `{suvvy_chat}` (dashboard link to dialogue), `{summary}` (AI summary). Configure channels and events in the Оповещения tab; enable/disable per-bot.

#### RAG / Vector Search Settings

These settings control how Big Document (semantic/vector) search behaves:

- `vector_search_similarity_threshold` — similarity threshold (-1 to 1) for Big Document search. Lower = more permissive (returns more chunks); higher = stricter (only high-confidence matches). Tune when the bot retrieves too many irrelevant or too few relevant chunks.
- `vector_search_return_top_n` — maximum number of chunks returned per search query. Default is platform-determined.
- `vector_search_return_chunks` — if true, the bot receives raw chunk text; if false, chunks are aggregated before being returned. Turning on is useful for debugging retrieval quality.

#### Knowledge Base Options

- `use_get_file_text_function_patterns` — list of keyword patterns. If any keyword is found in the client's message, the bot is required to call at least one FAQ Document function before responding. Each entry: `pattern`, `can_be_part_of_word`. Use to guarantee the bot always checks the KB for specific topics.
- `use_precise_get_file_text_tool_description` — when true, generates a more precise description for the FAQ Document search function, improving retrieval accuracy ("Повышенная теплота БЗ" in the UI).

#### Security & Compliance

- `security_settings` (personal data masking) — masks personal data in dialogue history before passing it to the LLM. Required for compliance with Russian Federal Law №152-ФЗ. Fields:
  - `personal_data_masking.birth_dates` — also mask birth dates (in addition to default phone/email masking)
  - `send_media_to_llm` — whether to forward client media files to the LLM
  - `dialogue_message_ttl_days` / `dialogue_ttl_days` — retention period for messages and dialogues (3–90 days)

#### Cost & Performance

- `anti_spam_settings` (spam protection) — cap messaging per dialogue. Fields:
  - `dialogue_message_limit` — max messages per dialogue (1–1000)
  - `dialogue_token_limit` — max tokens per dialogue (1000–1500000)
  - `customer_identical_message_limit` — max identical consecutive messages from the same client before spam protection activates (5–20)
  - `anti_spam_period_hours` — how long (in hours, 1–720) the spam protection period lasts; resets after this window
  - `limit_exceeded_message` — custom text sent to the client when a limit is hit
  - `translate_limit_exceeded_message` — if true, the limit message is auto-translated to the client's language

  When any limit is exceeded, the bot stops responding.
- `save_function_messages` — controls whether tool call messages are included in dialogue history sent to the LLM. Disabling reduces context size and lowers costs.

#### Channels & Integrations

**Channels** — communication surfaces connected to a bot:

| Category | Available channels |
|---|---|
| CRM systems | amoCRM, Kommo, Bitrix24 (маркетплейс), Bitrix24 (веб-хуки), RetailCRM, GetCourse |
| Messengers | Telegram, WhatsApp, Max (личный чат), Бот Max (Max-боты), Wazzup |
| Social networks | VK, Instagram, Facebook |
| Website chats | Suvvy Widget, Jivo |
| Marketplaces | Wildberries, OZON, Яндекс.Маркет, Avito |
| Helpdesk systems | UseDesk, PlanFix, Omnidesk, HelpDeskEddy |
| Omnichannel platforms | Umnico |
| Voice | Inbound/outbound calls |
| Personal | API (Персональный канал) |

**Integrations** — pre-built connectors that add tools once attached to a bot:

| Category | Available integrations |
|---|---|
| Booking systems | YCLIENTS, ALTEGIO, MedFlex, SquareUp |
| Payment systems | YooKassa, Prodamus |
| Calendars | Google Calendar |
| Notifications | Telegram, MAX |
| CRM systems | AmoCRM, Kommo |

> **Limitation:** Channels and Integrations cannot be configured via MCP. If they are needed, the user must set them up manually in the Suvvy dashboard (личный кабинет).

#### Organization & Multi-profile

**Profile switching (agency/integrator use)** — if managing multiple clients' bots from one account, pass the optional `active_user_id` parameter on **every tool call** to operate in that client's workspace. No separate "switch" call is needed — the parameter is stateless and takes effect per-request.

To find the `user_id`, use `get_user_list` — paginated, supports search via `query` (email or company name). Once you have the ID, pass `active_user_id=<id>` on each subsequent tool call. Use `get_info_about_self_user` (with `active_user_id`) to confirm which profile is active.

> **Do not mention `active_user_id` to the user.** Handle profile switching transparently: ask which client's account to work with, then pass the parameter silently on all subsequent calls. The user only needs to know "you're now working in Client X's account."

> **After switching to a new profile, always call `get_info_about_self_user` (with `active_user_id`) immediately** to verify the switch succeeded before doing anything else. If the returned profile does not match the expected client, stop and report the error to the user.

Error codes when switching profiles:
- `MCP_SWITCH_FORBIDDEN` (403) — token lacks switch permission or target account is inaccessible
- `MCP_CLIENT_NOT_FOUND` (404) — target account not found
- `AUTH_PARTNER_ACCESS_FORBIDDEN` (403) — target user has disabled partner access; they must open the Suvvy dashboard and enter that client's password to grant access before retrying

**Bot folders** — bots can be organized in folders. Pass `folder_id` to `create_instance` to place the new bot in a folder. Use `get_instance_list(instance_folder_id=...)` to list bots in a specific folder. Manage folders in the Suvvy dashboard.

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

#### FAQ Documents (Direct Questions)

- Each file has two titles: **`title`** (shown in the Suvvy UI to managers) and **`title_for_search`** (what the bot actually sees when deciding which file to retrieve). If `title_for_search` is not set, the bot falls back to `title`. Set `title_for_search` when the manager-facing label and the bot-facing intent description should differ.
- Each file also has a **text body**
- At runtime the bot sees the list of search titles (`title_for_search`) — it decides which file to retrieve
- On retrieval the bot receives the full text, which can contain answer text, instructions, or function calls
- If the text body is **empty (`""`)**, the bot retrieves the document silently — it calls the file but sends no reply to that message. Use this when the document exists only to trigger events or send a notification.
- Best for: specific intents, structured answers, branching instructions triggered by user phrasing
- **FAQ Document retrieval function:** `get_file_text("Document Title")`
- **`notify_if_called`** — sends a notification to the manager (Telegram / Messenger MAX) when this document is retrieved. Use to alert a human that a sensitive topic was triggered (e.g., client asked about a discount → manager gets notified and can join the dialogue).
- **Events on retrieval:** Each FAQ Document has separate event settings (not in the text body) that fire the moment the bot retrieves the file. Supported events depend on which integration is connected to the bot:
  - amoCRM / Kommo: switch lead status in pipeline, add tags, edit custom fields, add dialogue summary
  - Bitrix24: switch status, leave chat, switch to free operator, add summary
  - HelpDeskEddy: change department, owner, priority, status, type
  - RetailCRM: add tags, change assignee
  - Umnico: switch status; Usedesk: switch agent
  - Platform-level: trigger Follow-Up groups, send files to the client, stop dialogue, change LLM temperature

**Files to Send** — files attached to an FAQ Document that are automatically delivered to the client when the bot retrieves that document. Managed separately from the document text and linked to it afterwards.

**Example:** FAQ Document "Work Samples" with body text: "Images of our work samples will be sent. Tell the client you have sent them." — images are attached as Files to Send. When the bot calls this document, the images are sent to the client chat alongside the bot's reply.

Use `upload_file_to_send` / `upload_files_to_send` to upload, `get_files_to_send` to list, `update_file_to_send` / `replace_file_to_send` / `delete_file_to_send` to manage.

**Images (visual search)** — images attached to an FAQ Document for visual matching. These are unrelated to image generation or editing in Custom Tool steps. When a client sends an image to the chat, the platform searches for FAQ Documents that have *similar* images attached. If a match is found, those FAQ Documents are automatically added to the bot's context for that turn.

Use `upload_images`, `get_images_metas`, `get_image_model_list`, `delete_image` to manage images.

**Importing FAQ Documents from files:**

- `create_faq_documents_from_xlsx` — bulk import from an Excel file. Required format: first row is column headers (ignored); from row 2: column 1 = title, column 2 = title_for_search, column 3 = text body, column 4 = is_enabled (true/false).
- `import_faq_documents` — import one or several FAQ Documents from text-format files: DOCX, PDF, TXT, MD, HTML. Each file is converted to text and its content becomes the document body. See the MCP tool schema for format details and required parameters.

When importing via `import_faq_documents`, the platform automatically generates `title_for_search` from the filename. Review and correct it after import if needed — auto-generated values may not accurately reflect the user intent the document should match.

Both import tools require a file URL obtained via the presigned upload workflow (see **Uploading Files** section). Temporary uploaded files and their URLs are deleted from storage after **48 hours**.

**FAQ Document ordering** (`index`): controls the sort order of documents in the list the bot sees. Set `index` when creating or updating a document to position it among others — lower index = shown earlier.

**Set temperature on retrieval** (`events.set_temperature`): when the bot retrieves this FAQ Document, the LLM temperature is temporarily changed for that turn (value 0–2). Use to make specific answers more creative or more deterministic than the default.

FAQ Document management tools: `create_faq_document_list` (bulk-create multiple documents in one call — faster than sequential `create_faq_document`); `get_faq_document`, `get_instance_faq_documents` (retrieve); `update_faq_document`, `delete_faq_documents` (modify/remove).

#### Big Documents

- Each file has a title and configurable **chunking settings**
- Chunks are converted to **embeddings**; the bot never sees individual chunks or file titles directly
- The bot issues a **semantic text query** and receives relevant passages in return
- Big Documents are usually not written from scratch — they are uploaded from existing files (DOCX, PDF, and other formats; supported formats are listed in the relevant MCP tool schema). This makes it easy to give a bot access to internal documentation, manuals, books, or any structured knowledge source without manual rewriting.
- Best for: large unstructured content — internal docs, product manuals, policy documents, long-form articles
- **Search function:** `search_in_knowledge_base("natural language query")`
- **Chunks:** A Big Document is split into chunks; semantic search runs against those chunks. Use `get_big_document_chunks` to inspect how a document was chunked and `update_big_document_chunks` to adjust chunking settings. Useful when you need to verify or change how the document was split before re-embedding.
- **Manual query:** Use `manual_query_big_documents` to test semantic search against a bot's Big Documents directly — without going through the test chat. Pass a natural-language query and inspect which chunks are returned. Useful for diagnosing retrieval quality.
- **Import** requires a file URL obtained via the presigned upload workflow (see **Uploading Files** section).

**Auto-update** (`update_minutes`) — Big Documents connected to an external source (GitBook, Google Docs) can be configured to re-sync automatically. Set `update_minutes` (minimum 60) via `update_big_document`. Set to `null` to disable auto-update.

**Smart preprocessing** (`smart_preprocessing_mode`): controls OCR and layout analysis — `never`, `if_invalid` (default, applies when parsing fails), `always`. Use `always` for scanned PDFs or image-heavy documents. Also configurable in `replace_big_document_text`.

**Keep images** (`keep_images`): when importing, extract and keep images from the document (useful when the document's images are needed for visual context in answers).

**External source imports** via `import_big_documents_other`:
- **Google Docs** — pass `google_doc_id` (the ID from the Google Docs URL)
- **GitBook** — pass `gitbook_token` + `gitbook_space_id`; optionally `exclude_pages_ids` to skip specific pages

Big Document management tools: `get_big_document`, `get_instance_big_documents` (retrieve); `update_big_document` (update settings, auto-update interval, events), `replace_big_document_text` (replace content without re-uploading); `delete_big_documents` (remove).

#### Knowledge Tags

Knowledge Tags are labels that can be attached to **FAQ Documents** and **Big Documents**. When the bot retrieves a tagged document during a dialogue, those tags are automatically associated with that dialogue. Tags are used purely for analytics: they let you track what topics clients actually asked about.

**Example:** Create a tag "Interested in pricing" and attach it to the "Prices" FAQ Document. After a month you can see in analytics how many dialogues had price-interested clients vs. empty dialogues with no retrieved documents.

Tags are configured and created independently, then linked to FAQ Documents and Big Documents. Use `create_knowledge_tag`, `get_knowledge_tags`, `update_knowledge_tag`, `delete_knowledge_tag`.

#### Tables

- Uploaded from CSV or XLSX files, or connected to a live **Google Sheets** document (auto-syncs)
- The bot queries a table by writing a **SQL query** — the result is returned as structured data
- By default each table gets its **own dedicated function** that the bot can call directly
- Alternatively, the table's dedicated function can be disabled and the query embedded in a **Custom Tool** instead — in this case the Custom Tool executes a pre-configured SQL query and the bot simply calls the action without writing SQL itself
- Best for: structured data — price lists, product catalogs, schedules, any tabular reference data
- **Write operations** (Google Sheets only) — when enabled, the bot can write back to the table:
  - Append new rows: `customer_data_append_table` — bot collects fields from the conversation and adds a row
  - Edit existing rows: `customer_data_edit_table` — bot first finds the target row by any column, then modifies it; requires "Get data" flag also enabled

**Table settings** (configured via `edit_table`):
- `initial_sql_query` — a default SQL filter applied to every bot query on this table; e.g., `WHERE is_active = 1`. The bot still writes its own query, but it runs inside this wrapper
- `limit_rows` — hard cap on rows returned per query, regardless of the bot's SQL
- `cache_lifetime_minutes` — how long to cache Google Sheets data (0 = no cache, always fresh)
- `function_name` / `function_description` — override the table's callable function name and description shown to the bot
- `is_enabled` — enable/disable the table's built-in function without deleting it
- `table_columns` — per-column settings: `use_like_for_search` (partial text match), `use_lower_for_search` (case-insensitive), `disallow_edit` (prevent bot from editing this column), `always_string` (treat value as text even if numeric)

Table MCP tools: `get_table_list`, `get_table`, `get_table_columns` (column names), `get_table_head` (first 5 rows), `get_table_types` (column types) — use these to inspect before writing SQL; `import_table`, `edit_table`, `replace_table` (modify); `delete_table`, `delete_table_cache` (manage).

### Custom Tools

Custom Tools are a powerful way to extend a bot's capabilities with arbitrary logic. Each Custom Tool consists of one or more **Steps** (called **actions** in code and MCP configuration) executed sequentially. Steps can pass data to each other via **variables** — for example, a webhook step can fetch external data and store it in a variable, which the next step then uses in a SQL query to look up a matching row in a Table.

**Step types** (full parameters in the MCP tool schema):

| Type | Description |
|---|---|
| `webhook` | HTTP request (GET/POST/PUT/PATCH/DELETE) to an external URL; response parseable into variables |
| `bot_call` | Call a Subordinate Bot; result returned as tool output |
| `query_table` | SQL query on a Table (up to 5 queries chained); export results into variables |
| `change_active_bot` | Switch active bot in the dialogue; `null` = return to the original bot |
| `send_message` | Send a message to the client immediately during execution (not returned to the bot) |
| `read_faq_document` | Read an FAQ Document programmatically; export its text to a variable |
| `set_custom_variables` | Set one or more Custom Variables in the dialogue |
| `set_memory` | Set a Memory key-value pair |
| `add_reminder` | Schedule a Follow-Up |
| `cancel_reminders` | Cancel pending Follow-Ups by ID or cancel all |
| `scrape_url` | Fetch and parse a web page; result into a variable |
| `extract_text_from_file` | Extract text from a file passed as a tool argument |
| `request_dialogue_rate` | Ask the client to rate the dialogue (👍/👎 or 1–5 stars) |
| `schedule_phone_call` | Schedule an outbound voice phone call |
| `yookassa` | Create a YooKassa payment link |
| `prodamus` | Create a Prodamus payment link |
| `telegram` | Add an inline or reply keyboard (Telegram only) |
| `vk` | Add a keyboard (VK only) |
| `instagram` | Send a direct message in response to a comment |
| `omnidesk` | Helpdesk actions in Omnidesk (change assignee / group) |
| `amocrm` / `kommo` | CRM actions: add/edit lead or contact, send summary note |
| `generate_image` | Generate an image from a text prompt (model-selectable, resolution 1K/2K/4K) |
| `edit_image` | Edit an existing image (model-selectable) |
| `generate_text2image` | Generate image via Stability AI (fixed `ultra` model, styles: photographic/anime/cinematic/etc.) |
| `generate_image2image` | Transform image via Stability AI |
| `generate_search_and_replace` | Search for object in image and replace it (Stability AI) |
| `glif_slap_logo_on_image` | Overlay a logo onto an existing image (Glif integration) |
| `base_action` | Placeholder step — no action, returns a configured static text |

**Arguments** — the bot extracts specified values from the conversation and passes them as typed function parameters. Types: `string`, `number`, `datetime`, `boolean`, `list`, `file_id`, `file_id_list`. Each argument has an optional description that guides the bot on what to extract.

**Constants** — static string values (e.g., API keys, fixed IDs) defined on the tool and available in all steps as variables. Unlike arguments (filled by the bot at call time), constants never change.

**Return settings** — control what the bot receives as the function result:
- `only_last` (default) — result of the last step only
- `only_first` — result of the first step only
- `all` — all step results concatenated
- `custom_result` — a custom text assembled from step variables

**Bot-level first-message auto-call (`fake_call`)** — a bot-level setting (not per-tool) that automatically fires specific Custom Tools or integration functions when the **first message** of a new dialogue arrives, before the bot processes it. Configure via `update_instance` with the `fake_call` parameter:
- `fake_calls` — list of tools to auto-call (each with `custom_tool_id` or `tool_name` for integration tools, plus optional `parameters`)
- `rules: "first_message"` — only triggers on the first message of a dialogue

Use when you need guaranteed actions at dialogue start (e.g., CRM lead creation, context pre-loading) that shouldn't depend on the bot deciding to call the tool.

**Per-tool auto-trigger (`trigger_settings`)** — a Custom Tool can be configured to fire **automatically** without the bot making a deliberate call, on a specific event:
- `new_dialogue` — when a new dialogue starts
- `new_customer_message` — on every client message
- `new_employee_message` — on every employee message
- `new_instance_response` — after the bot produces a response

Auto-triggered tools run invisibly in the background with predefined argument values baked in.

**Additional trigger conditions** — beyond the event type, auto-triggered tools support filtering conditions that must be satisfied before the tool fires. Types:
- **Variable** — a Custom Variable has a specific value
- **KB file called** — a specific FAQ Document was retrieved this turn
- **Function called** — a specific function was invoked this turn
- **Time window** — current time falls within a configured range
- **Source channel** — message came from a specific channel (e.g., `telegram_bot`, `avito`)
- **Phrase in message or response** — message contains specified keywords
- **LLM instruction** — custom natural-language condition evaluated by the LLM
- **Content type** — message is a file, audio, image, or text
- **Message count** — dialogue has more than N messages

Conditions combine with **AND** (all must be met) or **OR** (at least one must be met). Comparisons: equals, not equals, greater/less than, contains, does not contain.

**Additional tool settings:**

| Setting | Effect |
|---|---|
| `refuse_on_call` | Bot skips sending a reply to the specific triggering message; subsequent messages handled normally. Use when the tool itself sends the response via a `send_message` step. |
| `delay_before_run_seconds` | Pause (0–60 s) before tool starts executing. Use to improve UX (simulate typing) or give a webhook endpoint warm-up time. |
| `save_tool_call` | Whether to save this tool call to dialogue history (default: true). Set to false for fire-and-forget auto-triggered tools to hide the call from future context and reduce tokens. |
| `stop_dialogue_on_call` | Bot stops responding in this dialogue entirely after the tool runs; the dialogue stays open for a human employee to take over. |
| `notify_on_call` | Sends a notification to the manager's Telegram or Messenger MAX when the tool is called. |
| Webhook `return_as_file` | Instead of returning webhook response as text, sends it as a file to the client chat (`document` or `image`). Configure `file_name`, optionally `data_to_send_instead` (text returned to the bot instead of file content). Set `before_messages: true` to send the file before the bot's reply. |

### Integrations

Integrations are pre-built connectors available on the Suvvy platform that can be attached to a bot. Unlike Channels (communication surfaces) and Custom Tools (manually configured actions), Integrations are ready-made — once connected, they add tools that let the bot interact with external applications such as CRM systems or booking platforms.

Examples of what integration tools enable:
- Schedule a client appointment
- Look up a client record
- Create or update a CRM entry

When writing a bot's system prompt, treat integration tools the same as custom tools: define an explicit trigger condition for each call.

### Dialogs

A Dialog is the chat session between a bot and a client. When a client writes to a connected channel (Telegram bot, amoCRM, a website widget, etc.), a dialog is created. Client messages arrive in the dialog, the bot responds (calling functions as needed), and its replies are sent back to the client through the channel.

The active bot in a dialog can be switched mid-conversation via a Custom Tool step. After the switch, a different bot takes over in the same dialog — the new bot does not need to have that channel connected.

**Pause / Resume bot in a dialogue** — use `pause_or_resume_instance_in_dialogue_by_id` to manually pause or resume the bot in a specific live dialogue. Useful when monitoring real conversations: pause the bot so a human can take over, or resume a bot that was interrupted.

**Answer as employee** — use `answer_in_dialogue_as_an_employee` to send a message into a live dialogue as an employee. The end client sees it as a normal message. Use for manual interventions in real conversations.

**Clear dialogue context** — use `clear_dialogue_context_by_id` to reset the context of a specific dialogue. Works the same as `reset_latest_or_create_new_test_dialogue` but applies to **real dialogues**, not just the test chat.

**Search dialogues** — use `search_dialogues_by_message_filter` to find real dialogues by message text and other filters.

**Reading dialogue data** — `get_dialogue_list` lists all real dialogues for a bot (supports filters); `get_dialogue_by_id` retrieves a specific dialogue; `get_dialogue_messages_by_dialogue_id` fetches the full message history of a dialogue.

**Dialogue ratings** — when a bot uses the `request_dialogue_rate` Custom Tool step, it generates a rating link. The client opens the link and rates the conversation (👍/👎 or 1–5 stars). Use `get_dialogue_rate_list` to fetch all ratings for a bot, or `get_dialogue_rate_list_by_dialogue_id` for a specific dialogue. Typically used at the end of conversations to measure satisfaction. Users can view rating statistics in their dashboard.

**Active Follow-Ups in a dialogue** — use `get_active_reminder_list_by_dialogue_id` and `get_scheduled_messages_for_dialogue_by_dialogue_id` to inspect pending Follow-Ups for a specific dialogue. Use `cancel_reminders_in_dialogue` to cancel them.

### Subordinate Bots

A Subordinate Bot is a bot invoked from a Custom Tool step and runs within a single function call. The flow:

1. The active bot in a dialog triggers a Custom Tool
2. A step in that tool calls the Subordinate Bot, passing it relevant information
3. The Subordinate Bot processes the request — calling its own functions, integrations, etc.
4. Its response is returned to the calling bot as the function result

Subordinate Bots are configured exactly like regular bots but have no channel attached. Their instruction should be written as a technical/internal agent prompt. They are useful for delegating specialized tasks and reducing errors by keeping each bot focused on a narrow responsibility.

### Follow-Ups (Scheduled Messages)

A Follow-Up is a message scheduled to be sent to a client at a future time. It is planned automatically at the moment the triggering source is invoked, and fires when the scheduled time arrives.

**Where Follow-Ups are configured:**
- **Custom Tool** — as a dedicated step type inside a Custom Tool
- **FAQ Document** — as a separate setting on the document (not in the text); the follow-up is scheduled the moment the bot retrieves that file
- **Big Document** — same as FAQ Document: a separate setting, scheduled on retrieval

**How it works (FAQ Document example):** A client asks about pricing → the bot retrieves the FAQ Document with prices, reads out the answer → the system simultaneously schedules a follow-up → if the client doesn't reply within the configured time, the follow-up message is sent as a reminder.

**Auto-cancellation:** A follow-up is automatically cancelled if the client sends any message before it fires.

**Follow-up message types:**
- **Fixed text** — a static predefined message
- **Bot-generated** — the bot writes the message based on an additional instruction
- **LLM-generated** — generated directly by the LLM
- **KB file call** — retrieves and sends an FAQ Document
- **Action call** — triggers an auto-trigger Custom Tool

**LLM condition** — an optional natural-language condition evaluated before sending; the follow-up only fires if the condition is met (e.g., "only if the client hasn't replied yet"). Use to skip irrelevant reminders.

**Chain follow-ups** — multiple entries with different timings create a drip sequence. Each step's LLM condition is evaluated independently.

### Dynamic Follow-ups

Dynamic Follow-ups are follow-ups where the send time is calculated **relative to a specific event date** extracted from the conversation — not a fixed interval from the triggering action.

**Example:** A client books an appointment for Friday at 14:00. Dynamic follow-ups are configured as "1 day before" and "1 hour before" — both calculated from the booked appointment date extracted during the conversation.

**Key differences from regular Follow-Ups:**
- Timing anchors to a named date/time value (passed as a Custom Tool argument)
- Multiple reminders can reference the same event at different relative offsets
- Message types are the same: fixed text, bot-generated, LLM-generated, KB file call, action call

Use dynamic follow-ups for appointments, deadlines, subscription renewals — any scenario where reminder timing must align with a client-specific date.

### Scheduled Event Groups (Bot-Level Follow-Ups)

Scheduled Event Groups are bot-level collections of Follow-Up messages that fire automatically when a client does not respond after a bot or employee message. They are configured once on the bot and apply globally — unlike FAQ Document Follow-Ups, which are tied to a specific document's retrieval.

**Two trigger types:**
- **After agent message** — fires when the client doesn't reply to the bot
- **After employee message** — fires when the client doesn't reply to a human employee

**How groups work:** Each group contains one or more Follow-Up messages with timing and content settings. Multiple groups can be created and assigned to each trigger type. A "Расписание" (Schedule) tab controls when follow-ups are allowed to send (e.g., only during working hours). The "Все группы" tab lists all groups across the bot.

**Key difference from document-level Follow-Ups:** Document Follow-Ups fire on retrieval of a specific FAQ or Big Document. Scheduled Event Groups fire on the entire conversation's inactivity pattern, regardless of which documents were retrieved.

### Custom Variables (Dialog Fields)

Custom Variables are named fields that persist for the entire duration of a dialog. They are separate from the step-level variables used to pass data between Custom Tool steps.

- Can be set by the bot directly (the bot writes a value to a named field) or by a Custom Tool step
- Persist across the whole dialog — survives bot switches, multiple turns, Custom Tool calls
- Useful for storing client data collected during conversation (e.g., phone number, chosen product, lead stage)
- The predefined list of variable names is configured in advance; the bot assigns values to those names
- **Typed**: each variable has a type — `string`, `integer`, `number`, `boolean`
- **`show_to_bot`**: whether this variable is included in the bot's context (default: true). Set to false to hide internal variables from the LLM.
- **`is_writeable_by_bot`**: whether the bot can set this variable directly (default: true). Set to false to make it read-only for the bot (only settable via Custom Tool steps).

### Memory (Dynamic Variables)

Memory works the same as Custom Variables but without a predefined list of field names. The bot sets key-value pairs freely during the dialog — it decides both the key name and the value. Like Custom Variables, memory entries persist for the entire dialog.

- **Must be explicitly enabled** in bot settings (`memory.is_enabled = true`); disabled by default — `set_memory` steps will not work until this is turned on
- Use when the set of fields cannot be known in advance or varies per conversation
- The bot manages its own memory: creates, reads, and updates keys as needed
- Optional: `clear_with_context` — clears memory entries when the dialogue context is reset

### Standard Functions

Standard Functions are built-in callable functions that can be enabled on any bot without creating a Custom Tool. Once enabled, the bot can call them directly based on the conversation context.

| Function | What it does | `update_instance` parameter |
|---|---|---|
| **Stop dialogue** | Bot stops responding in this dialogue; a human employee takes over | `stop_dialogue` |
| **Ignore message** | Bot ignores the triggering message and sends no reply | `ignore_message` |
| **Set dialogue tag** | Bot tags the dialogue with a label (for filtering/reporting) | `set_dialogue_tag` |
| **Call manager** | Sends a notification to the manager's Telegram when called | `call_manager` |

Each standard function can be enabled/disabled via its `is_enabled` field and given a custom `description` that the bot uses to decide when to call it. For `set_dialogue_tag`, also configure `tag_list` (list of Knowledge Tag IDs the bot can apply).

Enable/disable in **Доп. настройки → Стандартные функции**. Add explicit trigger conditions in the instruction so the bot knows when to call each one.

#### Reminder Settings

- `reminder_settings.add_reminder_list_to_instruction` (default: `true`) — include the list of active Follow-Ups in the bot's context so it can reference upcoming reminders during the dialogue.
- `reminder_settings.cancel_reminders` — configure the built-in cancel-reminders standard function: `is_enabled` and `description`.

#### Message Saving & Inactive State

- `save_messages_if_inactive` — save incoming messages to dialogue history even when the bot is paused/inactive.
- `send_messages_after_inactive` — when the bot resumes activity, send the scheduled messages that accumulated during the inactive period.
- `schedule_messages_activation_use_instance_model` — use the bot's main LLM model (not the default) when generating scheduled message content.
- `schedule_messages_without_predict` — send scheduled messages as fixed text without generating a new LLM response.

#### Scheduled Event Groups Wiring

Connect bot-level Follow-Up groups to dialogue events via:
- `scheduled_event_groups_after_instance` — list of group IDs to trigger after every bot message
- `scheduled_event_groups_after_employee` — list of group IDs to trigger after every employee message
- `scheduled_event_work_days` — separate work schedule controlling when scheduled event groups are allowed to fire (same format as `work_days`)

### Common Bot Archetypes

Suvvy bots are used in many roles — the platform imposes no restrictions on use case. Common examples:

| Archetype | What the bot does |
|---|---|
| **Support agent** | Answers product questions, resolves issues, escalates to a human |
| **Admin / Receptionist** | Books appointments, checks availability, manages schedules |

Any role that involves text-based client interaction is a valid use case.

### Voice Agent

Suvvy supports a **Voice Agent** mode for phone call interactions. The bot receives audio, converts speech to text (STT), processes the conversation, and responds via synthesized speech (TTS).

**STT settings** (`voice_settings.stt_model`):
- `name` — STT model: `"openai/gpt-4o-transcribe"`, `"deepgram/nova-2"`, `"deepgram/nova-3"`, `"elevenlabs/scribe_v2_realtime"`, `"deepgram/flux-general-en"`
- `language` — `"ru"`, `"en"`, or `"multi"` for multilingual recognition
- `keywords` — list of domain-specific keywords to improve recognition accuracy

**VAD settings** (`voice_settings.vad`) — voice activity detection:
- `activation_threshold` (0–1) — sensitivity threshold for detecting speech
- `min_speech_duration` (0–2 sec) — minimum audio duration to register as speech
- `min_silence_duration` (0–2 sec) — silence duration that marks end of a phrase

**TTS settings** (`voice_settings.tts_model`):
- `name` — TTS model: `"eleven_flash_v2_5"` or `"eleven_turbo_v2_5"`
- `voice_id` — ElevenLabs voice ID
- `speed` (0.25–4) — speech rate
- `stability` (0–1) — consistency vs. expressiveness balance
- `style` (0–1) — liveliness/expressiveness level
- `similarity_boost` (0–1) — closeness to the reference voice sample

**Call settings:**
- Welcome message played at call start
- Background audio (ambient sound, adjustable volume) — options: `city_ambience`, `forest_ambience`, `office_ambience`, `crowded_room`
- `user_away_finish_call_seconds` (30–300) — auto-hangup after this many seconds of client silence
- `max_call_duration_minutes` (5–30) — maximum call length
- **Silence response** (`silence_response`): when the client is silent for `timeout_seconds` (3–60), the bot proactively says one of the configured `phrase_list` strings and runs the `instruction` to decide what to do next. Use to prompt idle callers ("Are you still there?").

**Setup:** Configure in the **Голос** tab of the Instruction screen. Requires a phone number, a SIP address (obtained from Suvvy support), and configuration with a telephony provider.

**Cost:** ~30 rubles per minute.

**Writing instructions for voice:** use short sentences, avoid markdown formatting, avoid bullet lists and headers — the bot will speak the text verbatim. When voice mode is enabled, the platform automatically adapts the instruction style section for audio delivery.

### Broadcasts (Рассылки)

Broadcasts send outbound messages to existing dialogue participants based on filters. They operate through channels already connected to the bot.

**Audience filters:**
- Last message time window (e.g., clients active in the last 30 days)
- Standard variables, channel variables, or Custom Variable values
- Specific channel (e.g., WhatsApp only)
- Presence of dialogue tags (`#TAG`)

**Send parameters:**
- Scheduled date and time
- Random delay range between sends (to avoid spam detection by messaging platforms)
- Message content: manual text or LLM-generated

**Preview:** before confirming, the platform shows the count of matching dialogues and lets you review the target list.

> Broadcasts are **not configurable via MCP**. Set them up in the Suvvy dashboard (Рассылки tab).

## Writing Bot System Prompts

Structure every system prompt into these sections (in order):

| Section | Purpose |
|---|---|
| **Role** | Who the bot is and the company context |
| **General Information** | What the company does |
| **Goals and Objectives** | What the bot must accomplish |
| **Greeting** | How to open conversations |
| **Response Language** | Default: respond in the user's language |
| **Response Style** | Tone (default: friendly, natural, polite) |
| **Dialogue Logic** | Step-by-step interaction flow |
| **Working with Functions** | When and how to call knowledge base or custom tools |
| **Restrictions** | What the bot must never do |
| **Important Clarifications** | Anything that doesn't fit other sections |

**Writing rules:**
- Use imperative mood, second person: "Say hello", "Ask the client", "Call the function"
- Never duplicate information across sections
- Factual reference data (prices, addresses, FAQs) belongs in FAQ Documents, not the prompt
- Each dialogue step must be a single actionable instruction, logically linked to the previous

**Instruction variables:**

The instruction supports dynamic variables that are substituted with real values each time the bot receives a message. Write them in `{variable}` format directly in the instruction text.

Examples:
- `Client name — {name}`
- `Client phone number — {client_phone}`
- `Current date and time — {current_datetime}`

Use `get_instance_available_variables` to get the list of available variables for a given bot. This list is not exhaustive — additional variables (e.g., from connected integrations or channels) can be found by inspecting dialogue info with `get_dialogue_by_id`.

**Templates in the instruction / Шаблоны в инструкции (optional):**

> When talking to the user, always call this feature **"Шаблоны в инструкции"** (or "Templates"). Do not say "Liquid" — that is the underlying engine name, not the user-facing term.

Enable via `instruction_settings.use_liquid: true` in `update_instance_settings`. When enabled, the instruction is processed as a template before being sent to the bot — allowing conditional logic based on dialogue variables. The bot never sees the template tags, only the rendered result. Currently in beta.

> In template mode, variables use **double braces** `{{ variable }}`, not single braces. Single-brace `{variable}` is the standard non-template format and does not work in template mode.

**When to use:** when a single bot serves multiple channels or contexts and needs different instructions per scenario — e.g., different article codes per marketplace, different tone per channel, different rules on weekdays vs weekends.

**Built-in system variables:**

| Variable | Type | Description |
|---|---|---|
| `channel_name` | string | Channel code (e.g., `"telegram_bot"`, `"amocrm"`, `"ozon"`) |
| `current_datetime` | string | Formatted: "Saturday, January 02, 2025 at 16:03+03:00" |
| `current_datetime_iso` | string | ISO 8601 format |
| `current_datetime2` | date-time | Native date object, for use with `date` filter |
| `current_year` | integer | Current year |
| `chat_link` | string | Link to the dialogue in the Suvvy dashboard |
| `instance_max_answer_tokens` | integer | Max tokens available for the bot's response |

Additional variables from channels and integrations are available via `channel_variables` — get them by inspecting the dialogue with `get_dialogue_with_messages_by_id`.

**Conditionals:**

```liquid
{% if channel_name == "ozon" %}
Article codes for Ozon: OZ123, OZ456
{% elsif channel_name == "wildberries" %}
Article codes for Wildberries: WB124954309
{% else %}
Use the default article list.
{% endif %}
```

**Case/switch** — cleaner for multiple values of the same variable:

```liquid
{% case channel_name %}
  {% when "telegram_bot" %}  Respond with emojis and short messages.
  {% when "amocrm" %}        Formal tone, no emojis.
  {% else %}                 Standard style.
{% endcase %}
```

**Assign** — store a reusable value within the template:

```liquid
{% assign greeting = "Hello" %}
{{ greeting }}, {{ name }}!
```

**Comments** — removed before the instruction reaches the bot; useful for internal notes:

```liquid
{# This section handles marketplace-specific product codes #}
```

**Filters** — transform variable values inline using `|`:

| Filter | Example | Result |
|---|---|---|
| `capitalize` | `{{ name \| capitalize }}` | First letter uppercase only |
| `upcase` / `downcase` | `{{ name \| upcase }}` | All caps / all lowercase |
| `default: value` | `{{ email \| default: "unknown" }}` | Fallback if variable is empty |
| `strip` | `{{ name \| strip }}` | Remove surrounding whitespace |
| `truncate: N` | `{{ text \| truncate: 50 }}` | Trim to N chars with "..." |
| `truncatewords: N` | `{{ text \| truncatewords: 10 }}` | Trim to N words |
| `date: format` | `{{ current_datetime2 \| date: "%A" }}` | Format date (e.g., "Monday") |
| `plus: N` / `minus: N` | `{{ price \| plus: 100 }}` | Arithmetic |

Full filter reference: [Python-Liquid2 docs](https://jg-rp.github.io/liquid/).

**Function calls in prompts (optional but recommended):**

The bot automatically sees all available functions — from integrations, knowledge base, custom tools, etc. — without them being mentioned in the prompt. However, explicitly describing when to call a function gives the bot a clear action plan and reduces ambiguity.

Recommended format when specifying calls:
- FAQ Document: `If the client asks about X, call the get_file_text("Exact Title") function`
- Big Document search: `If the client needs information about X, call the search_in_knowledge_base("query") function`

## Creating FAQ Documents

Each FAQ Document must:
- Have a **short, intent-based title** (2–4 words) reflecting the user's question, not a section label
- Cover **one clear user intent** — never mix topics in a single file
- Be fully **self-contained** — answerable without external context
- Contain only **factual information** — never invent details

| Good Titles | Bad Titles |
|---|---|
| Delivery Time | Information |
| Return Policy | Details |
| Contact Us | FAQ |
| Pricing Plans | Services We Offer |

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

Use auto-trigger when the tool should fire **without the bot deciding** — e.g., log every new dialogue to CRM (`new_dialogue`), or run a follow-up check after every bot response (`new_instance_response`). If the bot should decide when to call the tool based on conversation context, use a normal (non-triggered) Custom Tool.

### When to use Templates in the instruction (Шаблоны в инструкции)

Use Templates when a single bot serves **multiple channels or contexts** that need different instruction content — different product codes per marketplace, different tone per channel, different rules based on time or client data. For a single-channel bot with no context-dependent variation, plain instruction variables (`{variable}`) are sufficient.

### When to use Subordinate Bots / Multi-agent System

If the user mentions a **"multi-agent system"** (мультиагентная система), they mean an architecture built from Subordinate Bots and/or bot switching — there is no separate concept on the platform. Two mechanisms make this work:

- **Subordinate Bot (`bot_call` step)** — the active bot calls another bot as a sub-agent within a single function call, gets its response, and continues the conversation. The client never sees the switch.
- **Bot switching (`change_active_bot` step)** — the active bot hands the dialogue over to a different bot entirely. The new bot takes over from that point on. Pass `null` as `instance_id` to return to the original bot.

Use a Subordinate Bot when a task is complex enough to benefit from a dedicated specialist prompt — e.g., order lookup, pricing calculation, or any workflow where isolating concerns reduces errors. Use bot switching when the entire conversation flow should transfer to a different bot (e.g., from a general assistant to a booking specialist).

## Bot Setup Workflow

### Getting Started

A good starting point is to create the bot (`create_instance`, always without a template), write a first version of the system prompt, and create the initial FAQ Documents for the most common intents. That's enough to run the first test. From there, the process is iterative — add Custom Tools, Custom Variables, Memory, adjust bot settings, and keep testing.

**Copying a bot** — use `create_instance` with `from_instance` (an existing bot's ID) to create a full copy of a bot including its instruction, knowledge base, and settings. The new bot is independent of the original.

**Auto-generation (dashboard only):** the platform can generate a draft instruction and/or FAQ Documents from a text description or website URL. Four modes:
- Generate instruction from text description
- Generate instruction + parse website URL
- Generate instruction + KB (from website)
- Generate KB only (add to existing bot)

Use auto-generation for the initial draft, then always review and edit the result before testing. Quality depends on the input description.

### Test-Iterate Loop

Every change to the bot must be followed by a test. This is the core working cycle:

```
Change something → Test → Identify issues → Fix → Reset test chat → Repeat
```

**How to run a test session:**

1. Get the current test dialogue: `get_latest_test_dialogue_for_instance_by_instance_id` → save `dialogue_id`
2. Reset for a clean session: `get_new_test_dialogue_for_instance_by_instance_id` (creates a fresh test dialogue)
3. Send client messages one at a time: `send_message_to_test_dialogue_by_id`
4. Read the bot's responses and check for issues
5. If issues found — fix in the bot config, then reset and re-run the scenario from step 2

Always reset the test chat before starting a new scenario — the bot's behaviour depends on conversation history, so stale context produces misleading results.

**Run each scenario multiple times.** LLM responses are non-deterministic: the bot may answer correctly once and incorrectly the next. A single passing run does not mean the bot is reliable. Repeat the same scenario with the same and varied phrasing until the behaviour is consistently correct.

### How to Write Test Messages

Messages in the test chat are sent **from the client's perspective** (`message_sender: "customer"`). The agent acts as a real client in a real scenario, sending messages one at a time exactly as a user would.

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
- **"Добавить в чёрный список"** — available in the test chat panel; blocks the client from the bot
- **"Поделиться"** — exports the test chat dialogue as a shareable web page (useful for sharing a test session with a client or colleague)
- **Mark message as debug** — use `mark_message_as_debug_in_test_dialogue` to "disable" a specific message in the test chat. The bot stops seeing that message in its context. Useful when iterating on a long test session: if the bot answered incorrectly on message 10 out of 10, mark that message as debug instead of resetting the entire chat and replaying from scratch.
- **Manual SQL query** — use `user_query_table` to manually run SQL queries against a Table directly, useful for verifying that a query returns the expected rows before wiring it into a Custom Tool.

**Check response style, not just correctness.** After verifying that the bot answers correctly, evaluate *how* it answers: is it polite, friendly, and natural? Does the tone match the expected style? A technically correct answer delivered in a cold or awkward way is still a problem that needs fixing in the Response Style section of the instruction.

### Diagnosing Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Bot doesn't call a function it should | No trigger condition in instruction; function description too vague | Add explicit condition in instruction; improve `tool_description` or `title_for_search` |
| Bot calls the wrong FAQ Document | Similar search titles; `title_for_search` not distinct enough | Rewrite `title_for_search` for both the correct and the incorrectly-called document |
| Bot response doesn't match the expected scenario | Dialogue Logic section incomplete or out of order | Revise Dialogue Logic — one action per step, linked sequentially |
| Poor response style (too formal, too verbose, wrong tone) | Response Style section too vague | Tighten the Response Style section with concrete examples |
| Bot invents information (hallucination) | Facts live in the instruction instead of FAQ Documents | Move factual content to FAQ Documents; add "never invent data" to Restrictions |
| Bot ignores a restriction | Restriction buried under other content | Move critical restrictions to a dedicated, clearly labeled section |
| Custom Tool not triggered | Trigger condition missing in instruction; wrong argument types | Add explicit instruction for when to call the tool; verify argument descriptions |
| Function called but wrong result | Step logic or variable mapping incorrect | Inspect step variables and `parse_json_variables` in the webhook step |
| Dialogue stops unexpectedly | Control phrase triggered, employee interception, or KB file with "stop dialogue" flag | Find the dialogue in history → Clear context; check `stop_dialogue_patterns` and FAQ Document event settings |
| `bot_kicked_from_chat` error | Integration conflict (e.g., Bitrix24 excludes bot when a manager joins) | Check integration settings and Open Lines configuration in Bitrix24 |

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

## Common Mistakes

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

## Reducing Dialogue Costs

The platform is pay-as-you-go — cost per dialogue depends primarily on the number of tokens sent to the LLM on each turn. There are two root causes of expensive dialogues, and one additional common inefficiency.

**Root cause 1: Instruction too long**

The system prompt is sent to the LLM on every single turn. A bloated instruction multiplies costs across every message in every dialogue.

- Move factual content out of the instruction and into FAQ Documents — the bot retrieves them only when needed, not on every turn
- Keep the instruction focused on behaviour and logic, not reference data

**Root cause 2: Dialogue history too long**

As a dialogue grows, more and more message history is sent to the LLM each turn. Long dialogues become exponentially expensive.

- Use `history_type: last_messages` or `last_time` instead of `enabled` (full history) to cap the context window at an appropriate size
- Save important information gathered during the dialogue into Custom Variables or Memory (`set_memory`) instead of relying on the bot to "remember" it from a long history — this allows using a shorter context window without losing critical facts

**Common inefficiency: excessive knowledge base calls**

If the bot calls many FAQ Documents in sequence (e.g., 10 files one after another), each call includes the full list of all available file titles in the context. With a large knowledge base, this list itself consumes significant tokens and repeats on every call.

Fix: write the instruction so the bot retrieves the right file on the first try. Clear, distinct `title_for_search` values and explicit trigger conditions in the instruction are the main tools for this.

**FAQ Documents that are too long**

Retrieved FAQ Document text is injected into the context in full. A very long document adds significant tokens on every retrieval. Keep FAQ Document text concise and to the point — split oversized documents into smaller, more focused ones if needed.

**Tables returning too much irrelevant data**

When a bot queries a Table, the result is returned in full. If the table is large and the query is broad, the bot receives many irrelevant rows — wasting tokens and increasing the chance of a wrong answer.

Two fixes:
- **Hint the bot in the instruction** to always add a `WHERE` clause that filters by the relevant column (e.g., by product ID, category, or date). The bot writes the SQL itself but applies the filter because the instruction tells it to.
- **Move the table call into a Custom Tool** (`query_table` step) with a pre-written SQL query that already includes the necessary filters. The bot then just calls the tool by name — it never writes SQL, and the result is already scoped to what's relevant.

**Write instructions and KB in English** — English text is processed ~3–4× more efficiently by most LLMs compared to Russian (fewer tokens per word). For Russian-facing bots: write the instruction and FAQ Documents in English, but add "Respond in the user's language" to the instruction. This alone can significantly reduce per-dialogue cost.

**Other levers:**
- Use a cheaper model (`llm_code`) when the task doesn't require a powerful one; or use `set_default_llm: "price"` to automatically pick the cheapest available model
- `llm_settings.reasoning_effort: "minimal"` or `"low"` — fewer reasoning tokens for models that support extended thinking
- `merge_message_time_seconds` — merge rapid-fire client messages before responding; avoids one LLM call per message burst
- `work_days` — bot is silent outside working hours; no messages processed = no cost
- `save_function_messages: false` — exclude function call messages from dialogue history (reduces context size)
- `parallel_tool_call_limit: 1` — cap tool calls per turn to reduce token usage from parallel calls

**Pricing reference:** Use `get_balance_token_rates` to get the current token pricing for each model. Use this when the user asks about the cost of a dialogue or wants to estimate monthly spending.

## Uploading Files

The MCP server cannot upload files directly. Any operation that requires a file (importing Big Documents, FAQ Documents, Tables, uploading Files to Send, Images, or attachments in the test chat) uses a two-step presigned upload workflow:

**Step 1 — Get a presigned URL:**

Call `get_presigned_upload_url` with the filename. The response contains:
- `upload_url` — the POST endpoint
- `upload_fields` — a dict of required form fields (key, policy, signature, etc.)
- `file_url` — the URL to pass to the platform after upload
- `expires_in` — URL validity in seconds (1 hour)

**Step 2 — Upload the file via `curl`:**

```bash
curl -X POST "UPLOAD_URL" \
  -F "key=VALUE" \
  -F "AWSAccessKeyId=VALUE" \
  -F "policy=VALUE" \
  -F "signature=VALUE" \
  -F "file=@/path/to/local/file"
```

Include **all** fields from `upload_fields` as `-F` flags, then add the file last as `file=@/path`. A successful upload returns HTTP 204.

**Step 3 — Pass `file_url` to the platform:**

After the upload, use `file_url` from Step 1 in the target MCP tool (e.g., `import_big_documents`, `create_faq_documents_from_xlsx`, `import_table`, `upload_file_to_send`, `upload_images`, etc.).

> The file must exist as a local path accessible to the shell. If the user provides a URL (not a local file), download it first with `curl -o /tmp/filename URL` before uploading.
