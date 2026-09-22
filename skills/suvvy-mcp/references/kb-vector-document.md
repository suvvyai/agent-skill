# Vector Documents

Vector Document is the knowledge base type for **large unstructured content** — internal docs, product manuals, policy documents, long-form articles. It replaces what used to be called "Big Document"; that name and its tools (`search_in_knowledge_base`, `get_big_document`, etc.) no longer exist.

- Each file has a **title** and configurable chunking (`split_rules`: `text_split_rules` + `chunk_size`)
- Chunks are converted to **embeddings**; the bot never sees individual chunks or file titles directly, only the matched passage text
- Vector Documents are usually not written from scratch — they are uploaded from existing files (DOCX, PDF, and other formats; supported formats are listed in the `import_vector_documents` MCP tool schema) or imported from Google Docs / GitBook
- **Import** requires a file URL obtained via the presigned upload workflow (see `references/uploading-files.md`)

## Search Functions

A bot doesn't search Vector Documents directly — it calls a **search function**, a named object that groups one or more Vector Documents and carries its own retrieval settings:
- `name` — the function name the bot calls, e.g. `search_documents("natural language query")`
- `description` / `query_description` — guide the bot on when and how to call it
- `similarity_threshold` (-1 to 1) and `top_n` — retrieval tuning, per function (not per instance)
- `vector_document_id_list` — which documents this function searches over

A bot can have several search functions, each scoped to a different subset of documents (e.g. one for product docs, one for policy docs). `import_vector_documents` can create a default search function automatically the first time documents are imported for an instance that has none yet.

**Management:** `create_vector_document_search_function`, `get_vector_document_search_function`, `list_vector_document_search_functions`, `update_vector_document_search_function`, `delete_vector_document_search_function`, `query_vector_document_search_function` (manual test query, bypassing the test chat).

## Chunks

- Use `get_vector_document_chunks` to inspect how a document was chunked (or preview chunking with different `text_split_rules`/`chunk_size` before committing)
- `update_vector_document_chunks` re-chunks a document that comes from an **external source** (Google Doc / GitBook) — not applicable to uploaded files
- `replace_vector_document_text` replaces a file's content without changing its identity or search-function membership

## Auto-Update (Google Docs / GitBook only)

`update_minutes` (minimum 60) on `update_vector_document` — re-syncs content from the external source on a schedule. Set to `null` to disable. Only applies to documents imported via `import_vector_documents_other`, not uploaded files.

**External source imports** via `import_vector_documents_other`:
- **Google Docs** — pass `google_doc_id` (the ID from the Google Docs URL)
- **GitBook** — pass `gitbook_token` + `gitbook_space_id`; optionally `exclude_pages_ids` to skip specific pages

> Google Docs / GitBook import is **not exposed via MCP** and must be set up in the dashboard; only file-URL import (`import_vector_documents`) is available to agents.

## Import Options

**Smart preprocessing** (`smart_preprocessing_mode`): controls OCR and layout analysis — `never`, `if_invalid` (default). Use for scanned PDFs or image-heavy documents.

**Smart read mode** (`smart_read_mode`): default `if_contains_images` — controls how the file is read/parsed when it contains images.

**Keep images** (`keep_images`): when importing, extract and keep images from the document.

## Management Tools

`get_vector_document`, `list_vector_documents` (retrieve); `import_vector_documents` (upload via file URL); `update_vector_document` (title, context, split rules, auto-update interval); `replace_vector_document_text` (replace content without re-uploading as a new document); `delete_vector_documents` (remove, by ID list).
