# Big Documents

- Each file has a title and configurable **chunking settings**
- Chunks are converted to **embeddings**; the bot never sees individual chunks or file titles directly
- The bot issues a **semantic text query** and receives relevant passages in return
- Big Documents are usually not written from scratch — they are uploaded from existing files (DOCX, PDF, and other formats; supported formats are listed in the relevant MCP tool schema).
- Best for: large unstructured content — internal docs, product manuals, policy documents, long-form articles
- **Search function:** `search_in_knowledge_base("natural language query")`
- **Import** requires a file URL obtained via the presigned upload workflow (see `references/uploading-files.md`).

## Chunks and Search

- **Chunks:** A Big Document is split into chunks; semantic search runs against those chunks. Use `get_big_document_chunks` to inspect how a document was chunked and `update_big_document_chunks` to adjust chunking settings.
- **Manual query:** Use `manual_query_big_documents` to test semantic search directly — without going through the test chat. Pass a natural-language query and inspect which chunks are returned. Useful for diagnosing retrieval quality.

## Auto-Update

`update_minutes` — Big Documents connected to an external source (GitBook, Google Docs) can be configured to re-sync automatically. Set `update_minutes` (minimum 60) via `update_big_document`. Set to `null` to disable.

## Import Options

**Smart preprocessing** (`smart_preprocessing_mode`): controls OCR and layout analysis — `never`, `if_invalid` (default), `always`. Use `always` for scanned PDFs or image-heavy documents.

**Keep images** (`keep_images`): when importing, extract and keep images from the document.

**External source imports** via `import_big_documents_other`:
- **Google Docs** — pass `google_doc_id` (the ID from the Google Docs URL)
- **GitBook** — pass `gitbook_token` + `gitbook_space_id`; optionally `exclude_pages_ids` to skip specific pages

## Management Tools

`get_big_document`, `get_instance_big_documents` (retrieve); `update_big_document` (update settings, auto-update interval, events); `replace_big_document_text` (replace content without re-uploading); `delete_big_documents` (remove).
