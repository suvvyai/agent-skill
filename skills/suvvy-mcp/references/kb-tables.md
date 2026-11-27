# Tables

- Uploaded from CSV or XLSX files, or connected to a live **Google Sheets** document (auto-syncs)
- The bot queries a table by writing a **SQL query** — the result is returned as structured data
- By default each table gets its **own dedicated function** that the bot can call directly
- Alternatively, the table's dedicated function can be disabled and the query embedded in a **Custom Tool** instead — the Custom Tool executes a pre-configured SQL query and the bot simply calls the action without writing SQL itself
- Best for: structured data — price lists, product catalogs, schedules, any tabular reference data

## Write Operations (Google Sheets Only)

When enabled via `edit_table`, the bot can write back to the table:
- `allow_append` — append new rows; the bot gets the function `<function_name>_append_table` (e.g. `customer_data_append_table`) and collects fields from the conversation. Optional `append_table_instruction` guides it
- `allow_edit` — edit existing rows via `<function_name>_edit_table`; the bot first finds the target row by any column, then modifies it. Optional `edit_table_instruction`

The read function is `<function_name>_table`. Use `get_instance_functions` to see the exact function names a bot has.

## Table Settings (via `edit_table`)

All changes go in `body` — pass only the fields you change.

- `initial_sql_query` — a full SQL query against the table `data` that runs **first** in the bot's query chain; the result of each query is the input of the next one. Write a complete query, e.g. `SELECT * FROM data WHERE is_active = 1` — not a bare `WHERE` fragment
- `limit_rows` — hard cap on rows returned per query
- `cache_lifetime_minutes` — how long to cache Google Sheets data (0 = no cache, always fresh)
- `function_name` / `function_description` — base of the table's function names (`<function_name>_table`, `_edit_table`, `_append_table`) and the description shown to the bot
- `is_enabled` — enable/disable the table's built-in function without deleting it
- `table_columns` — columns the bot sees: an object `{"<column index in the source, from 0>": {name, ...flags}}`. **It replaces the previous value entirely** — columns missing from the object become invisible to the bot, so read the current columns first and pass all of them. `name` is required; flags: `use_like_for_search` (partial text match), `use_lower_for_search` (case-insensitive), `disallow_edit` (prevent bot from editing this column), `always_string` (treat value as text even if numeric)
- `google_spreadsheet_sheet_id`, `notify_on_update`, `return_sync_data` — Google Sheets sheet and sync options

## Management Tools

`get_table_list`, `get_table`, `get_table_columns` (column names), `get_table_head` (first 5 rows), `get_table_types` (column types) — use these to inspect before writing SQL; `import_table`, `edit_table`, `replace_table` (modify); `delete_table`, `delete_table_cache` (manage).

- `import_table` / `replace_table` take `body` with a `type`: `google` + `google_spreadsheet_id`, `csv` + `file_url`, or `excel` + `file_url` (+ `sheet_index` if there are several sheets). Files up to 30 MB, uploaded first — see `references/uploading-files.md`. `replace_table` keeps the table's name.
- `user_query_table` — run SQL manually: `sql_query` is a chain of queries against `data` executed in order; `use_initial_query` (default `true`) runs the table's `initial_sql_query` first; `use_raw_query` skips column-setting transformations. Useful to check rows before wiring a query into a Custom Tool.
