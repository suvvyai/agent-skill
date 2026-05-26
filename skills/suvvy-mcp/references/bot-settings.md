# Key Bot Settings

All bot settings are updated via `update_instance`.

## LLM & Generation

- `llm_code` — model used in production; `test_llm_code` — model used only in the test chat (does not affect live dialogues)
- `llm_settings.reasoning_effort` — reasoning depth: `minimal` / `low` / `medium` / `high`
- `llm_settings.web_search` — enable internet search (configure `country` and optionally `allowed_domains`)
- Use `get_llm_list` to fetch the current list of available models before setting `llm_code` or `test_llm_code`.
- `set_default_llm` — shortcut to pick a model automatically: `price` (cheapest available) or `quality` (highest quality available). Use instead of specifying `llm_code` directly.
- `randomness` — response randomness (integer 0–100): `0` = most deterministic, `10` = balanced, `20` = creative. The UI shows this as Стабильность / Сбалансированность / Креативность.
- `llm_settings.verbosity` — response length: `low`, `medium`, `high`. Use `low` for support bots and marketplaces, `high` for detailed explanations.
- `parallel_tool_call_limit` — functions callable simultaneously per turn (default: 10). Hard limit: **10 function calls per single dialogue turn** — scenarios requiring more will fail with an error.

## Dialogue History

`history_type` controls how much context is passed to the LLM each turn:

| Value | Behavior |
|---|---|
| `enabled` | Full history |
| `disabled` | No history |
| `last_time` | Last N minutes — set duration via `history_time_minutes` |
| `last_messages` | Last N messages — set count via `history_last_messages_first_index` |

- `add_datetime_system_messages` — automatically prepend current date and time to every system message. Useful when the bot needs to be aware of the current time without explicit `{current_datetime}` in the instruction.

## Image Handling

- `image_description_mode`:
  - `disabled` — images from clients are ignored
  - `vision` — LLM sees the image directly (requires a vision-capable model)
  - `if_not_found_in_knowledge_base` — first tries to match the image to an FAQ Document; if no match, a helper model describes the image and passes the text to the bot; use for models without native vision support
  - `always` — always describe images with a helper model regardless of KB match
- `image_description_instruction` — custom instruction (up to 1024 chars) passed to the helper model when describing client images. Use to focus on domain-specific attributes (e.g., "describe the product name and defect type").
- `image_search_threshold` — similarity threshold (0–20) for visual search matching in FAQ Documents. Lower = more permissive; higher = stricter.

## Message Filtering & Working Hours

- `work_days` — per-day time ranges when the bot responds; silent outside configured hours. Format per day: `["HH:MM:SS-HH:MM:SS"]`. Also set `timezone` (offset from UTC, e.g. `3` for Moscow).
- `ignore_customer_patterns` / `ignore_employee_patterns` — regex patterns; matching messages are silently skipped. Each entry: `pattern`, `can_be_part_of_word`, `dont_add_message` (if true, also excluded from dialogue history).
- `stop_dialogue_patterns` — if a client message matches, the bot stops responding until resumed.
- `resume_customer_dialogue_patterns` / `resume_employee_dialogue_patterns` — patterns that re-activate a stopped bot.

## Employee Interception

- `interception_by_employee` — when a manager writes in the same channel chat, the system detects it and freezes the bot so the human can handle the conversation directly.
- `ignored_employee_messages_count` — number of first employee messages to ignore before triggering interception.
- `sleep_time_minutes` — auto-resume: after this many minutes of employee inactivity, the bot regains control. Set to `-1` to disable auto-resume.
- **Additional interception conditions**: the bot can be configured to not reply to the specific message that triggered the interception, or to specify phrases that will not trigger interception.

## Response Formatting

- `structured_answer` — default mode: bot can send images/files by URL and split one response into multiple sequential messages. Set `chat_instruction` (up to 1000 chars) for formatting guidance. Custom `json_schema` mode makes the bot always return raw JSON.
- `answer_split` — how the bot splits its response: `do_not_split`, `by_paragraphs`, `by_paragraphs3`, `by_lines`, `by_sentences`, `by_words`, `by_symbols`, `by_symbols_nearest_word`, `by_symbols_nearest_sentence`, `by_symbols_nearest_line`, `by_tokens_nearest_word`, `by_tokens_nearest_sentence`, `by_tokens_nearest_line`, `by_markdown_sections`, `by_markdown_sections_paragraphs` (default), `by_markdown_sections_paragraphs3`. Configure `chunk_size` (max tokens per chunk).
- `send_message_sleep_seconds` — static delay (0–60 s) between sequential message chunks.
- `send_message_dynamic_sleep` — dynamic delay between chunks based on chunk length. Overrides static delay for text chunks.
- `message_header` / `message_footer` — static text prepended or appended to every bot reply.
- `starting_message_list` — up to 10 suggestion buttons at dialogue start (each with `title` and `text`). Useful for website widgets and Telegram bots.
- `replacement_patterns` — find/replace pairs applied to all bot responses. Each entry: `pattern`, `replacement`, `can_be_part_of_word` (default false).
- `fallback_message` — static reply sent when the bot cannot process a message (e.g., unsupported file type).

## Notifications & Alerts

- **`notify_on_call` / `notify_if_called`** (on Custom Tools and FAQ Documents): sends a notification to the manager's Telegram or Messenger MAX when the tool or document is triggered.
- **`refuse_on_call` / `refuse_if_called`** (on Custom Tools and FAQ Documents): bot skips the reply for the specific triggering message. Dialogue continues normally on subsequent messages. On FAQ Documents, setting an empty text body (`""`) achieves the same silent-retrieval effect.
- `notification_settings` — configure Telegram or Messenger MAX notification templates. Set `summary_instruction` (LLM prompt for what to extract as a summary) and `document_used_template`. Template variables: `{bot}`, `{source}`, `{document}`, `{suvvy_chat}`, `{summary}`.

## RAG / Vector Search Settings

- `vector_search_similarity_threshold` — similarity threshold (-1 to 1) for Big Document search. Lower = more permissive; higher = stricter.
- `vector_search_return_top_n` — maximum number of chunks returned per search query.
- `vector_search_return_chunks` — if true, the bot receives raw chunk text; useful for debugging retrieval quality.

## Knowledge Base Options

- `use_get_file_text_function_patterns` — list of keyword patterns; if any keyword is found in the client's message, the bot must call at least one FAQ Document function before responding. Each entry: `pattern`, `can_be_part_of_word`.
- `use_precise_get_file_text_tool_description` — when true, generates a more precise description for the FAQ Document search function ("Повышенная теплота БЗ" in the UI).

## Security & Compliance

- `security_settings` — masks personal data in dialogue history before passing to the LLM. Required for compliance with Russian Federal Law №152-ФЗ. Fields:
  - `personal_data_masking.birth_dates` — also mask birth dates
  - `send_media_to_llm` — whether to forward client media files to the LLM
  - `dialogue_message_ttl_days` / `dialogue_ttl_days` — retention period for messages and dialogues (3–90 days)

## Cost & Performance

- `anti_spam_settings` — cap messaging per dialogue:
  - `dialogue_message_limit` — max messages per dialogue (1–1000)
  - `dialogue_token_limit` — max tokens per dialogue (1000–1500000)
  - `customer_identical_message_limit` — max identical consecutive messages (5–20)
  - `anti_spam_period_hours` — how long the spam protection period lasts (1–720 hours)
  - `limit_exceeded_message` — custom text sent when a limit is hit
  - `translate_limit_exceeded_message` — if true, the limit message is auto-translated to the client's language

  When any limit is exceeded, the bot stops responding.
- `save_function_messages` — whether tool call messages are included in dialogue history. Disabling reduces context size and lowers costs.

## Channels & Integrations

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

> **Limitation:** Channels and Integrations cannot be configured via MCP. If they are needed, the user must set them up manually in the Suvvy dashboard.

## Organization & Multi-profile

**Profile switching (agency/integrator use)** — pass the optional `active_user_id` parameter on **every tool call** to operate in a client's workspace. No separate "switch" call is needed — the parameter is stateless and takes effect per-request.

To find the `user_id`, use `get_user_list` — paginated, supports search via `query` (email or company name). Use `get_info_about_self_user` (with `active_user_id`) to confirm which profile is active.

> **Do not mention `active_user_id` to the user.** Handle profile switching transparently: ask which client's account to work with, then pass the parameter silently on all subsequent calls.

> **After switching to a new profile, always call `get_info_about_self_user` immediately** to verify the switch succeeded before doing anything else.

Error codes when switching profiles:
- `MCP_SWITCH_FORBIDDEN` (403) — token lacks switch permission or target account is inaccessible
- `MCP_CLIENT_NOT_FOUND` (404) — target account not found
- `AUTH_PARTNER_ACCESS_FORBIDDEN` (403) — target user has disabled partner access; they must open the Suvvy dashboard and enter that client's password to grant access before retrying

**Bot folders** — pass `folder_id` to `create_instance` to place the new bot in a folder. Use `get_instance_list(instance_folder_id=...)` to list bots in a specific folder.
