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

All bot settings are updated via `update_instance_settings`. The most important ones:

**LLM:**
- `llm_code` — model used in production; `test_llm_code` — model used only in the test chat (does not affect live dialogues)
- `llm_settings.reasoning_effort` — reasoning depth: `minimal` / `low` / `medium` / `high`
- `llm_settings.web_search` — enable internet search (configure `country` and optionally `allowed_domains`)

**Dialogue history** (`history_type`):
- `enabled` — full history | `disabled` — no history | `last_time` — last N minutes | `last_messages` — last N messages
- Controls how much context is passed to the LLM each turn

**Working hours** (`work_days`): per-day time ranges when the bot responds; silent outside configured hours.

**Employee interception** (`interception_by_employee`): when a manager writes in the same channel chat (WhatsApp, Telegram, etc.), the system detects it and freezes the bot so the human can handle the conversation directly.

**Image handling** (`image_description_mode`):
- `disabled` — images from clients are ignored
- `vision` — the LLM sees the image directly (requires a vision-capable model)
- `if_not_found_in_knowledge_base` — first tries to match the image to an FAQ Document; if no match, a helper model describes the image and passes the text description to the bot; use for models without native vision support
- `always` — always describe images with a helper model regardless of knowledge base match

**Structured answer** (`structured_answer`): when enabled in default mode (no custom JSON schema), the bot can send images and files by writing a direct URL in its response, and can split one response into multiple sequential messages. Custom schema mode makes the bot always return a raw JSON object.

**Message patterns:**
- `ignore_customer_patterns` / `ignore_employee_patterns` — regex patterns; matching messages are silently skipped by the bot
- `stop_dialogue_patterns` — if a client message matches, the bot stops responding in this dialogue until resumed
- `resume_customer_dialogue_patterns` / `resume_employee_dialogue_patterns` — patterns that re-activate a stopped bot

**`notify_on_call` / `notify_if_called`** (on Custom Tools and FAQ Documents): sends a notification to the manager's Telegram or Messenger MAX when the tool or document is triggered. Use to alert a human when a sensitive topic comes up.

**`refuse_on_call` / `refuse_if_called`** (on Custom Tools and FAQ Documents): bot skips the reply for the specific triggering message. Dialogue continues normally on subsequent messages. On FAQ Documents, setting an empty text body (`""`) achieves the same silent-retrieval effect.

### Functions

Every bot has a unified list of callable functions. The bot can call any function from this list in accordance with its instruction. Functions come from four sources:

- **Knowledge base** — `get_file_text` (FAQ Documents), `search_in_knowledge_base` (Big Documents), and per-table functions (Tables)
- **Custom Tools** — manually configured actions
- **Channels** — some channel integrations expose their own functions
- **Integrations** — pre-built connectors add their own functions (CRM, booking, etc.)

### Knowledge Base

Suvvy supports three knowledge base types that can run simultaneously on the same bot.

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

#### Big Documents

- Each file has a title and configurable **chunking settings**
- Chunks are converted to **embeddings**; the bot never sees individual chunks or file titles directly
- The bot issues a **semantic text query** and receives relevant passages in return
- Big Documents are usually not written from scratch — they are uploaded from existing files (DOCX, PDF, and other formats; supported formats are listed in the relevant MCP tool schema). This makes it easy to give a bot access to internal documentation, manuals, books, or any structured knowledge source without manual rewriting.
- Best for: large unstructured content — internal docs, product manuals, policy documents, long-form articles
- **MCP search function:** `search_in_knowledge_base("natural language query")`

#### Tables

- Uploaded from CSV or XLSX files
- The bot queries a table by writing a **SQL query** — the result is returned as structured data
- By default each table gets its **own dedicated function** that the bot can call directly
- Alternatively, the table's dedicated function can be disabled and the query embedded in a **Custom Tool** instead — in this case the Custom Tool executes a pre-configured SQL query and the bot simply calls the action without writing SQL itself
- Best for: structured data — price lists, product catalogs, schedules, any tabular reference data

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
| `generate_image` | Generate an image from a text prompt |
| `edit_image` | Edit an existing image |
| `base_action` | Placeholder step — no action, returns a configured static text |

**Arguments** — the bot extracts specified values from the conversation and passes them as typed function parameters. Types: `string`, `number`, `datetime`, `boolean`, `list`, `file_id`, `file_id_list`. Each argument has an optional description that guides the bot on what to extract.

**Constants** — static string values (e.g., API keys, fixed IDs) defined on the tool and available in all steps as variables. Unlike arguments (filled by the bot at call time), constants never change.

**Return settings** — control what the bot receives as the function result:
- `only_last` (default) — result of the last step only
- `only_first` — result of the first step only
- `all` — all step results concatenated
- `custom_result` — a custom text assembled from step variables

**Auto-trigger (`trigger_settings`)** — a Custom Tool can be configured to fire **automatically** without the bot making a deliberate call, on a specific event:
- `new_dialogue` — when a new dialogue starts
- `new_customer_message` — on every client message
- `new_employee_message` — on every employee message
- `new_instance_response` — after the bot produces a response

Auto-triggered tools run invisibly in the background with predefined argument values baked in.

**`refuse_on_call`** — bot skips sending a reply to the specific message that triggered this tool. Subsequent messages are handled normally. Use when the tool itself sends the response via a `send_message` step.

**`stop_dialogue_on_call`** — bot stops responding in this dialogue entirely after the tool runs. The dialogue stays open for a human employee to take over.

**`notify_on_call`** — sends a notification to the manager's Telegram or Messenger MAX when the tool is called. Use to alert a human that something notable happened (e.g., client asked about a sensitive topic).

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

There are multiple follow-up types; full details and parameters are in the MCP tool schema.

### Custom Variables (Dialog Fields)

Custom Variables are named fields that persist for the entire duration of a dialog. They are separate from the step-level variables used to pass data between Custom Tool steps.

- Can be set by the bot directly (the bot writes a value to a named field) or by a Custom Tool step
- Persist across the whole dialog — survives bot switches, multiple turns, Custom Tool calls
- Useful for storing client data collected during conversation (e.g., phone number, chosen product, lead stage)
- The predefined list of variable names is configured in advance; the bot assigns values to those names

### Memory (Dynamic Variables)

Memory works the same as Custom Variables but without a predefined list of field names. The bot sets key-value pairs freely during the dialog — it decides both the key name and the value. Like Custom Variables, memory entries persist for the entire dialog.

- **Must be explicitly enabled** in bot settings (`memory.is_enabled = true`); disabled by default — `set_memory` steps will not work until this is turned on
- Use when the set of fields cannot be known in advance or varies per conversation
- The bot manages its own memory: creates, reads, and updates keys as needed
- Optional: `clear_with_context` — clears memory entries when the dialogue context is reset

### Common Bot Archetypes

Suvvy bots are used in many roles — the platform imposes no restrictions on use case. Common examples:

| Archetype | What the bot does |
|---|---|
| **Support agent** | Answers product questions, resolves issues, escalates to a human |
| **Admin / Receptionist** | Books appointments, checks availability, manages schedules |

Any role that involves text-based client interaction is a valid use case.

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

Use `get_instance_instruction_variables` to get the list of available variables for a given bot. This list is not exhaustive — additional variables (e.g., from connected integrations or channels) can be found by inspecting dialogue info with `get_dialogue_with_messages_by_id`.

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

### Test-Iterate Loop

Every change to the bot must be followed by a test. This is the core working cycle:

```
Change something → Test → Identify issues → Fix → Reset test chat → Repeat
```

**How to run a test session:**

1. Get the test dialogue: `get_latest_test_dialogue_for_instance_by_instance_id` → save `dialogue_id`
2. Reset for a clean session: `reset_latest_or_create_new_test_dialogue_for_instance_by`
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
| Using `set_memory` steps without enabling memory in bot settings | Enable `memory.is_enabled = true` first |
| `title` and `title_for_search` mismatch — bot sees wrong description | Set `title_for_search` to an intent-based phrase the bot will recognize |
| Creating bot from a platform template | Always create without a template (`template_code: "default"`, no `template_variable`) |
| Expecting `test_llm_code` model to affect live dialogues | `test_llm_code` only applies in the test chat |
