# Vector Documents

Vector Document is the knowledge base type for **large unstructured content** — internal docs, product manuals, policy documents, long-form articles. It replaces what used to be called "Big Document"; that name and its tools (`search_in_knowledge_base`, `get_big_document`, etc.) no longer exist.

- Each file has a **title** and configurable chunking — at import: flat `text_split_rules` + `chunk_size`; on an existing document (`update_vector_document`): `body.split_rules = {rules, chunk_size}`
- Chunks are converted to **embeddings**; the bot never sees individual chunks or file titles directly, only the matched passage text
- Vector Documents are usually not written from scratch — they are uploaded from existing files (DOCX, PDF and other document formats) or imported from Google Docs / GitBook (dashboard only)
- **Import** (`import_vector_documents`) takes `file_url_list` — 1–20 URLs obtained via the presigned upload workflow (see `references/uploading-files.md`). The tool waits for processing and returns final statuses; a document is searchable only in status `ready_for_search`
- Keep `generate_embeddings: true` (default) — without embeddings the document is not searchable

## Search Functions

A bot doesn't search Vector Documents directly — it calls a **search function**, a named object that groups one or more Vector Documents and carries its own retrieval settings:
- `name` — base of the function name; the bot sees it as **`<name>_vector_document_search`** (e.g. `search_documents` → `search_documents_vector_document_search("natural language query")`). `get_instance_functions` lists the real names
- `description` / `query_description` — guide the bot on when and how to call it (`null` in an update restores the default)
- `similarity_threshold` (-1 to 1) and `top_n` — retrieval tuning, per function (not per instance)
- `vector_document_id_list` — which documents this function searches over

A bot can have several search functions, each scoped to a different subset of documents (e.g. one for product docs, one for policy docs). `create_vector_document_search_function` creates one with threshold 0.5 and 10 chunks. On import, documents are attached to a function only if you pass `search_function_id`, or pass `instance_id` of a bot that has no search functions yet — then a `search_documents` function is created automatically. Otherwise imported documents aren't searchable by any bot until you add them to a function.

**Management:** `create_vector_document_search_function`, `get_vector_document_search_function`, `list_vector_document_search_functions`, `update_vector_document_search_function`, `delete_vector_document_search_function`, `query_vector_document_search_function` (manual test query, bypassing the test chat).

## Chunks

- Use `get_vector_document_chunks` to inspect how a document was chunked (or preview chunking with different `text_split_rules` / `chunk_size` before committing)
- `update_vector_document_chunks` re-chunks a document that comes from an **external source** (Google Doc / GitBook) — not applicable to uploaded files
- `replace_vector_document_text` replaces a file's content without changing its identity or search-function membership

## Auto-Update (Google Docs / GitBook only)

Google Docs / GitBook import is **dashboard-only**; only file-URL import (`import_vector_documents`) is available via MCP. For documents already imported from those sources (`type` = `google_doc` / `gitbook`), `update_vector_document` accepts:
- `body.update_minutes` (minimum 60) — re-sync content from the source on a schedule; `null` disables it
- `body.gitbook_exclude_pages_ids` — GitBook pages to leave out (re-builds chunks)

## Import Options

**Smart preprocessing** (`smart_preprocessing_mode`): LLM clean-up of the extracted text — `never`, `if_invalid` (default), `always`. Spends balance.

**Smart read mode** (`smart_read_mode`): LLM-based reading of the file — `never`, `always`, `if_contains_images` (default). Use for scanned PDFs or image-heavy documents. Spends balance.

**Keep images** (`keep_images`): keep images in the document text as links — the bot sees them in matched chunks.

## Management Tools

`get_vector_document`, `list_vector_documents` (retrieve); `import_vector_documents` (upload via file URL); `update_vector_document` (`body`: `title`, `context`, `split_rules`, `update_minutes`, `gitbook_exclude_pages_ids`); `replace_vector_document_text` (replace content without re-uploading as a new document); `delete_vector_documents` (remove, by ID list).
