# Custom Tools

Custom Tools extend a bot's capabilities with arbitrary logic. Each consists of one or more **Steps** (called **actions** in code and MCP configuration) executed sequentially. Steps can pass data to each other via **variables** — for example, a webhook step can fetch external data and store it in a variable, which the next step then uses in a SQL query.

## Tools

| Tool | Purpose |
|---|---|
| `get_custom_tool_action_schema` | JSON schema of one step by `action_type` — **build every step from it**, don't guess step fields |
| `create_custom_tool` | Create a tool on a bot (`instance_id` + `body`) |
| `update_custom_tool_by_id` | Change a tool: only the passed fields change, but a passed `actions`, `arguments`, `constants`, `return_settings`, `trigger_settings` or `tag_list` replaces the previous value entirely (`trigger_settings: null` removes the auto-trigger) |
| `get_custom_tool_by_id` / `get_instance_custom_tool_list_by_instance_id` | Read one tool / all tools of a bot |
| `delete_custom_tool_by_id` | Delete |
| `test_webhook_action` | Run one webhook step manually: `custom_tool_id` + `body` with `action_index` (from 0) and your own `arguments` / `variables` instead of LLM-filled values; file arguments take Files to Send IDs in `file_id_list_by_argument` (`{"<argument name>": [file IDs]}`). Errors of the request itself come back in the response body with `error_type`, not as a call error; a wrong index, a non-webhook step or missing arguments / variables still fail the call |

> **A new Custom Tool is created disabled** (`is_enabled` defaults to `false`). Pass `is_enabled: true` when creating it, or enable it afterwards — otherwise the bot never sees it.

Main `body` fields: `title`, `tool_name` (function name the bot sees), `tool_description` (description for the bot), `actions` (1–10 steps), `arguments`, `constants`, `return_settings`, `trigger_settings`, plus the settings in "Additional Tool Settings" below.

## Step Types

| Type | Description |
|---|---|
| `webhook` | HTTP request (GET/POST/PUT/PATCH/DELETE) to an external URL; response parseable into variables |
| `bot_call` | Call a Subordinate Bot; result returned as tool output |
| `query_table` | SQL query on a Table (up to 5 queries chained); export results into variables |
| `change_active_bot` | Switch active bot in the dialogue; `null` = return to the original bot |
| `send_message` | Send a message to the client immediately during execution (not returned to the bot) |
| `read_faq_document` | Read an FAQ Document programmatically; export its text to a variable |
| `set_custom_variables` | Set one or more Custom Variables in the dialogue — keys of `variables` are Custom Variable **IDs**, not names |
| `set_memory` | Set a Memory key-value pair |
| `add_reminder` | Schedule a Dynamic Follow-up (see `references/follow-ups.md`) |
| `cancel_reminders` | Cancel pending reminders created by `add_reminder` — by ID or all of them |
| `scrape_url` | Fetch and parse a web page; result into a variable |
| `extract_text_from_file` | Extract text from a file passed as a tool argument |
| `request_dialogue_rate` | Ask the client to rate the dialogue (👍/👎 or 1–5 stars) |
| `schedule_phone_call` | Schedule an outbound voice phone call |
| `yookassa` | Create a YooKassa payment link |
| `prodamus` | Create a Prodamus payment link |
| `telegram` | Add an inline or reply keyboard, or remove the reply keyboard (Telegram only) |
| `vk` | Add a keyboard (VK only) |
| `instagram` | Send a direct message in response to a comment |
| `omnidesk` | Helpdesk actions in Omnidesk (change assignee / group) |
| `amocrm` / `kommo` | CRM actions: add/edit lead or contact, send summary note |
| `bitrix` | Bitrix24 actions: add/edit lead or deal and contact |
| `transfer_call_to_manager` | Voice calls: transfer the call to a manager's `phone` |
| `max_bot` | Bot-side actions for Max-боты (Max channel), separate from `telegram`/`vk` steps |
| `send_message_to_new_chat` | Start a new chat and send a message into it — channels `wazzup`, `telegram_personal`, `max_personal`, `whatsapp` |
| `query_vector_knowledge_base` | Manually query a Vector Knowledge Base and export the matched answer(s) to a variable |
| `generate_image` | Generate an image from a text prompt. `model` selects from the image model catalog (`get_image_model_list`); `resolution` (`1K`/`2K`/`4K`) and `aspect_ratio` are optional |
| `edit_image` | Edit an existing image passed via `file_argument`. Same `model`/`resolution`/`aspect_ratio` parameters as `generate_image`; number of input images is capped by the chosen model |
| `base_action` | Placeholder step — no action, returns a configured static text |

> There is no `generate_text2image` / `generate_image2image` / `generate_search_and_replace` / `glif_slap_logo_on_image` step — those provider-specific steps were merged into the unified `generate_image` / `edit_image` steps above. Always call `get_image_model_list` to see which models and providers are currently available before picking `model`.

## Arguments, Constants, Return Settings

**Arguments** — the bot extracts specified values from the conversation and passes them as typed function parameters. `arguments` is an object `{"<name>": {"type": ..., "description": ...}}`; names are lowercase words joined by `_` (`^[a-z]+(_[a-z]+)*$`, up to 24 chars). Types: `string`, `number`, `datetime`, `boolean`, `list`, `file_id`, `file_id_list`. **`file_id` requires `file_type`** (`image` or `document`); for `file_id_list` it defaults to `document`. Each argument has an optional description that guides the bot on what to extract.

**Constants** — static string values (e.g., API keys, fixed IDs) defined on the tool and available in all steps as variables. Unlike arguments (filled by the bot at call time), constants never change.

**Return settings** — control what the bot receives as the function result:
- `only_last` (default) — result of the last step only
- `only_first` — result of the first step only
- `all` — all step results concatenated
- `custom_result` — a custom text assembled from parts: `return_settings.custom_result.parts`, each part `{type: string | tool_argument | variable}`

## Auto-Trigger Settings

**Bot-level first-message auto-call (`fake_call`)** — automatically fires specific Custom Tools when the **first message** of a new dialogue arrives, before the bot processes it:
- `fake_calls` — list of tools to auto-call (each with `custom_tool_id` or `tool_name` for integration tools, plus optional `parameters`)
- `rules: "first_message"` — only triggers on the first message of a dialogue

> **Not available via MCP.** `fake_call` is not accepted by `update_instance_mcp`. It can only be configured in the Suvvy dashboard.

Use when you need guaranteed actions at dialogue start (e.g., CRM lead creation, context pre-loading) that shouldn't depend on the bot deciding to call the tool.

**Per-tool auto-trigger (`trigger_settings`)** — a Custom Tool can be configured to fire **automatically** without the bot making a deliberate call, on a specific event:
- `new_dialogue` — when a new dialogue starts
- `new_customer_message` — on every client message
- `new_employee_message` — on every employee message
- `new_instance_response` — after the bot produces a response
- `after_voice_call` — after a voice call ends

`trigger_settings` = `{condition, argument_values, call_condition_id}`:
- `condition` — one of the events above
- `argument_values` — required: a value for **every** argument of the tool, since no LLM fills them (a tool with `file_id` / `file_id_list` arguments can't have an auto-trigger). String values are templates: `{{ variable }}` and `{% if %}` work (see `references/writing-prompts.md`)
- `call_condition_id` — optional Call Condition that must be met for the trigger to fire

Auto-triggered tools run invisibly in the background.

**Additional trigger conditions** are a separate object — a **Call Condition** — created with `create_call_condition` and attached via `trigger_settings.call_condition_id`. Groups combine with AND, conditions inside a group with OR; condition types include variable value, FAQ Document or function called, time of day / date, channel, phrase in message or answer, LLM instruction, content type, message counters, dialogue cost. See `references/call-conditions.md`.

## Additional Tool Settings

| Setting | Effect |
|---|---|
| `refuse_on_call` | Bot skips sending a reply to the specific triggering message; subsequent messages handled normally. Use when the tool itself sends the response via a `send_message` step. |
| `delay_before_run_seconds` | Pause (0–60 s) before tool starts executing. |
| `save_tool_call` | Whether to save this tool call to dialogue history (default: true). Set to false for fire-and-forget auto-triggered tools. |
| `stop_dialogue_on_call` | Bot stops responding in this dialogue entirely after the tool runs. |
| `notify_on_call` | Sends a notification to the manager's Telegram or Messenger MAX when the tool is called. |
| `notify_on_error` | Notification when the tool fails (default: true). |
| `stop_on_error` | Stop the dialogue when the tool fails. |
| `error_message` | Text the bot receives when the tool fails. |
| `tag_list` | Knowledge Tag IDs set on the dialogue when the tool is called. |
| Webhook `return_as_file` | Instead of returning webhook response as text, sends it as a file to the client chat (`document` or `image`). Configure `file_name`, optionally `data_to_send_instead`. Set `before_messages: true` to send the file before the bot's reply. |
