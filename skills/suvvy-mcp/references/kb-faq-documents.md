# FAQ Documents

- Each file has two titles: **`title`** (shown in the Suvvy UI to managers) and **`title_for_search`** (what the bot actually sees when deciding which file to retrieve; unique within the bot). If `title` is omitted, it is generated from the text; if `title_for_search` is omitted, it is generated from the title. Set `title_for_search` explicitly when the manager-facing label and the bot-facing intent description should differ.
- Each file also has a **text body** (`text`, required)
- At runtime the bot sees the list of search titles (`title_for_search`) — it decides which file to retrieve
- On retrieval the bot receives the full text, which can contain answer text, instructions, or function calls
- **`refuse_if_called`** — the bot sends no reply to the message on which it retrieved this document. Use when the document exists only to trigger events or send a notification.
- Best for: specific intents, structured answers, branching instructions triggered by user phrasing
- **FAQ Document retrieval function:** `get_file_text("Document Title")`
- **`notify_if_called`** — sends a notification to the manager (Telegram / Messenger MAX) when this document is retrieved.
- **`tags`** — Knowledge Tag IDs set on the dialogue when the document is retrieved (see `references/kb-tags.md`).
- **Events on retrieval** (`events`, not in the text body) fire the moment the bot retrieves the file. Via MCP you can set:
  - `scheduled_event_groups` — Follow-Up group IDs to start (see `references/follow-ups.md`)
  - `send_files` — `{files_to_send: [file IDs], send_before_message}` — send Files to Send to the client
  - `stop_dialogue` — stop the dialogue after the answer
  - `set_temperature` — model temperature for this answer
  - CRM events (amoCRM / Kommo, Bitrix24, HelpDeskEddy, RetailCRM, Umnico, Usedesk — switch status, add tags, edit fields, add summary, etc.) are configured in the dashboard. MCP returns them read-only in `events.crm_events`; updating a document through MCP keeps them.

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

## Decoy FAQ Documents (Подменные прямые вопросы)

A technique for stopping hallucinations on a **specific forbidden topic** when a restriction in the instruction alone doesn't work.

**Problem:** the instruction clearly says "do NOT invent bus routes, transport numbers, or schedules — offer to call the administrator instead", but the bot still invents them. By the moment of answering, a restriction buried in the instruction loses to the bot's drive to give the client *some* information.

**Fix:** create an FAQ Document whose `title_for_search` looks like the answer source for that exact topic (e.g., "Маршруты и расписание автобусов"). The bot, hoping to find the answer for the client, retrieves the file — and instead of data finds a corrective instruction:

> Информации о маршрутах, номерах транспорта и расписании автобусов нет. Не называй никакие маршруты и номера. Предложи клиенту позвонить администратору.

Because the retrieved text lands in the bot's context at the exact moment it is about to answer, it blocks the hallucination far more reliably than the same restriction in the instruction.

**Guidelines:**
- `title_for_search` must look like a genuine answer source for the topic — that is what lures the bot into retrieving it. A title like "Запрет на маршруты" won't be retrieved.
- The body states plainly that the information does not exist, forbids inventing it, and says what to do instead (redirect to a human, give a safe fallback answer).
- One decoy per forbidden topic — the usual "one file = one intent" rule applies.
- For stubborn cases, combine with KB Keywords so retrieval is forced whenever topic words appear in the client's message.

## Files to Send

Files attached to an FAQ Document that are automatically delivered to the client when the bot retrieves that document. Managed separately from the document text and linked to it afterwards.

**Example:** FAQ Document "Work Samples" with body text: "Images of our work samples will be sent. Tell the client you have sent them." — images are attached as Files to Send. When the bot calls this document, the images are sent to the client chat alongside the bot's reply.

Use `upload_file_to_send` / `upload_files_to_send` to upload, `get_files_to_send` to list, `update_file_to_send` / `replace_file_to_send` / `delete_file_to_send` to manage. Attach them to a document via `events.send_files.files_to_send`.

## Images (Visual Search)

Images attached to an FAQ Document for visual matching. When a client sends an image to the chat, the platform searches for FAQ Documents that have *similar* images attached. If a match is found, those FAQ Documents are automatically added to the bot's context for that turn.

Images for visual search are managed **in the dashboard only** — MCP returns the attached image IDs read-only in `connected_images`. The matching threshold `image_search_threshold` is set via `update_instance_mcp` (see `references/bot-settings.md`).

## Importing FAQ Documents

`create_faq_documents_from_xlsx` is the only bulk import. Format: first row = headers (ignored), rows 2–100 are processed. Columns are either **title, text** or **title, title_for_search, text, is_enabled** (`true`/`false`). Without the `is_enabled` column (or with an empty cell) **the document is created disabled** — enable it with `update_faq_document`. Valid rows are created even if other rows have errors — the tool then still returns an error (`TABLE_ROWS_ARE_INVALID`) with row numbers in three lists:
- `validate_error` — the row failed validation (e.g. a value is too long)
- `empty_rows` — the row has no title; unlike `create_faq_document`, the import does not generate a title from the text
- `duplicates` — the title or search title repeats another row of the file or an existing document of the bot

Rows whose title already exists in the bot are skipped, so re-sending the whole file does not duplicate documents — the rows created earlier just come back in `duplicates`. Fix the failed rows and send them again.

The file (`.xlsx`, up to 5 MB) is uploaded via the presigned upload workflow first (see `references/uploading-files.md`). Importing FAQ Documents from DOCX/PDF/other files is not available via MCP.

## Additional Settings

**FAQ Document ordering** (`index`, in `update_faq_document`): controls sort order in the list the bot sees. Lower index = shown earlier.

**`is_enabled`** — whether the document is connected to the bot (default `true` for `create_faq_document`).

**Set temperature on retrieval** (`events.set_temperature`): when the bot retrieves this document, LLM temperature is temporarily changed for that turn (value 0–2).

**Management tools:** `create_faq_document` (one document per call; for many documents at once use `create_faq_documents_from_xlsx`); `get_faq_document`, `get_instance_faq_documents` (retrieve); `update_faq_document`, `delete_faq_documents` (modify/remove).
