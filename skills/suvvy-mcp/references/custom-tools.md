# Custom Tools

Custom Tools extend a bot's capabilities with arbitrary logic. Each consists of one or more **Steps** (called **actions** in code and MCP configuration) executed sequentially. Steps can pass data to each other via **variables** — for example, a webhook step can fetch external data and store it in a variable, which the next step then uses in a SQL query.

## Step Types

Full parameters in the MCP tool schema:

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

## Arguments, Constants, Return Settings

**Arguments** — the bot extracts specified values from the conversation and passes them as typed function parameters. Types: `string`, `number`, `datetime`, `boolean`, `list`, `file_id`, `file_id_list`. Each argument has an optional description that guides the bot on what to extract.

**Constants** — static string values (e.g., API keys, fixed IDs) defined on the tool and available in all steps as variables. Unlike arguments (filled by the bot at call time), constants never change.

**Return settings** — control what the bot receives as the function result:
- `only_last` (default) — result of the last step only
- `only_first` — result of the first step only
- `all` — all step results concatenated
- `custom_result` — a custom text assembled from step variables

## Auto-Trigger Settings

**Bot-level first-message auto-call (`fake_call`)** — automatically fires specific Custom Tools when the **first message** of a new dialogue arrives, before the bot processes it. Configure via `update_instance` with the `fake_call` parameter:
- `fake_calls` — list of tools to auto-call (each with `custom_tool_id` or `tool_name` for integration tools, plus optional `parameters`)
- `rules: "first_message"` — only triggers on the first message of a dialogue

Use when you need guaranteed actions at dialogue start (e.g., CRM lead creation, context pre-loading) that shouldn't depend on the bot deciding to call the tool.

**Per-tool auto-trigger (`trigger_settings`)** — a Custom Tool can be configured to fire **automatically** without the bot making a deliberate call, on a specific event:
- `new_dialogue` — when a new dialogue starts
- `new_customer_message` — on every client message
- `new_employee_message` — on every employee message
- `new_instance_response` — after the bot produces a response

Auto-triggered tools run invisibly in the background with predefined argument values baked in.

**Additional trigger conditions** — filtering conditions that must be satisfied before the tool fires:
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

## Additional Tool Settings

| Setting | Effect |
|---|---|
| `refuse_on_call` | Bot skips sending a reply to the specific triggering message; subsequent messages handled normally. Use when the tool itself sends the response via a `send_message` step. |
| `delay_before_run_seconds` | Pause (0–60 s) before tool starts executing. |
| `save_tool_call` | Whether to save this tool call to dialogue history (default: true). Set to false for fire-and-forget auto-triggered tools. |
| `stop_dialogue_on_call` | Bot stops responding in this dialogue entirely after the tool runs. |
| `notify_on_call` | Sends a notification to the manager's Telegram or Messenger MAX when the tool is called. |
| Webhook `return_as_file` | Instead of returning webhook response as text, sends it as a file to the client chat (`document` or `image`). Configure `file_name`, optionally `data_to_send_instead`. Set `before_messages: true` to send the file before the bot's reply. |
