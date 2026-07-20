# FAQ Documents

- Each file has two titles: **`title`** (shown in the Suvvy UI to managers) and **`title_for_search`** (what the bot actually sees when deciding which file to retrieve). If `title_for_search` is not set, the bot falls back to `title`. Set `title_for_search` when the manager-facing label and the bot-facing intent description should differ.
- Each file also has a **text body**
- At runtime the bot sees the list of search titles (`title_for_search`) — it decides which file to retrieve
- On retrieval the bot receives the full text, which can contain answer text, instructions, or function calls
- If the text body is **empty (`""`)**, the bot retrieves the document silently — it calls the file but sends no reply to that message. Use this when the document exists only to trigger events or send a notification.
- Best for: specific intents, structured answers, branching instructions triggered by user phrasing
- **FAQ Document retrieval function:** `get_file_text("Document Title")`
- **`notify_if_called`** — sends a notification to the manager (Telegram / Messenger MAX) when this document is retrieved.
- **Events on retrieval:** Each FAQ Document has separate event settings (not in the text body) that fire the moment the bot retrieves the file. Supported events depend on which integration is connected to the bot:
  - amoCRM / Kommo: switch lead status in pipeline, add tags, edit custom fields, add dialogue summary
  - Bitrix24: switch status, leave chat, switch to free operator, add summary
  - HelpDeskEddy: change department, owner, priority, status, type
  - RetailCRM: add tags, change assignee
  - Umnico: switch status; Usedesk: switch agent
  - Platform-level: trigger Follow-Up groups, send files to the client, stop dialogue, change LLM temperature

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

Use `upload_file_to_send` / `upload_files_to_send` to upload, `get_files_to_send` to list, `update_file_to_send` / `replace_file_to_send` / `delete_file_to_send` to manage.

## Images (Visual Search)

Images attached to an FAQ Document for visual matching. When a client sends an image to the chat, the platform searches for FAQ Documents that have *similar* images attached. If a match is found, those FAQ Documents are automatically added to the bot's context for that turn.

Use `upload_images`, `get_images_metas`, `get_image_model_list`, `delete_image` to manage images.

## Importing FAQ Documents

- `create_faq_documents_from_xlsx` — bulk import from Excel. Required format: first row = column headers (ignored); from row 2: column 1 = title, column 2 = title_for_search, column 3 = text body, column 4 = is_enabled (true/false).
- `import_faq_documents` — import from DOCX, PDF, TXT, MD, HTML. Each file's content becomes the document body.

When importing via `import_faq_documents`, the platform auto-generates `title_for_search` from the filename. Review and correct it after import — auto-generated values may not accurately reflect user intent.

Both import tools require a file URL obtained via the presigned upload workflow (see `references/uploading-files.md`). Temporary uploaded files expire after **48 hours**.

## Additional Settings

**FAQ Document ordering** (`index`): controls sort order in the list the bot sees. Lower index = shown earlier.

**Set temperature on retrieval** (`events.set_temperature`): when the bot retrieves this document, LLM temperature is temporarily changed for that turn (value 0–2).

**Management tools:** `create_faq_document_list` (bulk-create — faster than sequential `create_faq_document`); `get_faq_document`, `get_instance_faq_documents` (retrieve); `update_faq_document`, `delete_faq_documents` (modify/remove).
