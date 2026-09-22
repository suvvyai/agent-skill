# Vector Knowledge Base

Vector Knowledge Base is a knowledge base type built from **question/answer pairs** matched via semantic (embedding) search rather than the exact-title matching FAQ Documents use. It sits between FAQ Documents (exact intent match) and Vector Documents (unstructured file search): use it when you have many short Q&A-shaped facts that don't map cleanly to a fixed set of FAQ titles.

This is a distinct feature from Vector Documents (`references/kb-vector-document.md`) — different data model, different tools, do not confuse the two.

- A bot has zero or more Vector Knowledge Bases, each exposed to the bot as its own **named function** (`function_name`) — the bot calls it like any other retrieval function
- Each knowledge base holds many `question` / `answer` pairs (each with a `usefulness` score, 1–10, that biases which pairs surface)
- `search_return_top_n` and `search_similarity_threshold` (per knowledge base, not per instance) control retrieval
- Attaching a knowledge base to a bot is done via `update_instance_mcp`'s `vector_knowledge_base_id_list`

## Creating and Filling

1. `create_vector_knowledge_base` — pass `name` (display name) and `function_name` (must be unique per user; this is what the bot calls)
2. Add pairs either one at a time (`create_vector_knowledge_base_file`, `update_vector_knowledge_base_file`, `delete_vector_knowledge_base_file`) or in bulk via `upload_vector_knowledge_base_xlsx` (question/answer/usefulness columns, uploaded via the presigned-URL flow — see `references/uploading-files.md`)
3. Attach it to a bot: add its ID to `vector_knowledge_base_id_list` via `update_instance_mcp`

## Manual Testing

`query_vector_knowledge_base` — run a query against a knowledge base directly, outside the test chat, to check which pairs would be retrieved for a given question.

## Auto-Update Workflow

A Vector Knowledge Base can be configured to **learn from live dialogues**: after a dialogue, the system can extract candidate question/answer pairs from it and propose changes to the knowledge base as an **update report**, rather than writing directly.

- Wiring a specific knowledge base into a bot's auto-update pipeline is **dashboard-only for now** — not available via MCP.
- Whether a proposed report applies automatically or needs a human/agent decision is controlled by `auto_apply` (default `true`) in the knowledge base's update settings, along with `extraction_prompt` / `distillation_prompt` / `merge_prompt` (custom LLM prompts for the extraction pipeline) and thresholds (`merged_threshold`, `compression_minimum_threshold`).
- When `auto_apply` is off, review pending reports with `list_vector_knowledge_base_update_reports`, then `apply_vector_knowledge_base_update_report` or `reject_vector_knowledge_base_update_report` for each one.

## What's Not Available via MCP

- Tags and Follow-Ups on retrieval — these are FAQ-Document-only features; Vector Knowledge Base pairs have neither.
- Wiring a knowledge base into the auto-update pipeline (dashboard-only, see above).

## Management Tools

`create_vector_knowledge_base`, `get_vector_knowledge_base`, `list_vector_knowledge_bases`, `update_vector_knowledge_base`, `delete_vector_knowledge_base` (base itself); `create_vector_knowledge_base_file`, `update_vector_knowledge_base_file`, `delete_vector_knowledge_base_file`, `list_vector_knowledge_base_files`, `upload_vector_knowledge_base_xlsx` (pairs); `query_vector_knowledge_base` (manual test); `list_vector_knowledge_base_update_reports`, `apply_vector_knowledge_base_update_report`, `reject_vector_knowledge_base_update_report` (auto-update review).
