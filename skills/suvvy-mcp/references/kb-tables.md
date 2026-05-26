# Tables

- Uploaded from CSV or XLSX files, or connected to a live **Google Sheets** document (auto-syncs)
- The bot queries a table by writing a **SQL query** — the result is returned as structured data
- By default each table gets its **own dedicated function** that the bot can call directly
- Alternatively, the table's dedicated function can be disabled and the query embedded in a **Custom Tool** instead — the Custom Tool executes a pre-configured SQL query and the bot simply calls the action without writing SQL itself
- Best for: structured data — price lists, product catalogs, schedules, any tabular reference data

## Write Operations (Google Sheets Only)

When enabled, the bot can write back to the table:
- Append new rows: `customer_data_append_table` — bot collects fields from the conversation and adds a row
- Edit existing rows: `customer_data_edit_table` — bot first finds the target row by any column, then modifies it; requires "Get data" flag also enabled

## Table Settings (via `edit_table`)

- `initial_sql_query` — a default SQL filter applied to every bot query; e.g., `WHERE is_active = 1`. The bot still writes its own query, but it runs inside this wrapper
- `limit_rows` — hard cap on rows returned per query
- `cache_lifetime_minutes` — how long to cache Google Sheets data (0 = no cache, always fresh)
- `function_name` / `function_description` — override the table's callable function name and description shown to the bot
- `is_enabled` — enable/disable the table's built-in function without deleting it
- `table_columns` — per-column settings: `use_like_for_search` (partial text match), `use_lower_for_search` (case-insensitive), `disallow_edit` (prevent bot from editing this column), `always_string` (treat value as text even if numeric)

## Management Tools

`get_table_list`, `get_table`, `get_table_columns` (column names), `get_table_head` (first 5 rows), `get_table_types` (column types) — use these to inspect before writing SQL; `import_table`, `edit_table`, `replace_table` (modify); `delete_table`, `delete_table_cache` (manage).
