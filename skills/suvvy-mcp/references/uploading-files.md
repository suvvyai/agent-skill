# Uploading Files

The MCP server does not accept file contents (no base64) — every operation that needs a file takes a URL of a file uploaded to Suvvy storage first, using a presigned upload workflow. Links to other sites are not accepted: download such a file locally first, then upload it.

## Step 1 — Get a Presigned URL

Call `get_presigned_upload_url` with the `filename` (with extension) and `max_size_bytes` — the limit of the tool you will pass the file to (see the table below; default and maximum is 300 MB). The response contains:
- `upload_url` — the POST endpoint
- `upload_fields` — a dict of required form fields (key, policy, signature, etc.)
- `file_url` — the URL to pass to the platform after upload
- `expires_in` — URL validity in seconds (1 hour)

## Step 2 — Upload the File via `curl`

```bash
curl -X POST "UPLOAD_URL" \
  -F "key=VALUE" \
  -F "AWSAccessKeyId=VALUE" \
  -F "policy=VALUE" \
  -F "signature=VALUE" \
  -F "file=@/path/to/local/file"
```

Include **all** fields from `upload_fields` as `-F` flags, then add the file last as `file=@/path`. A successful upload returns HTTP 204. The upload is rejected if the file exceeds `max_size_bytes`.

## Step 3 — Pass `file_url` to the Platform

| Tool | Parameter | Limit (`max_size_bytes`) |
|---|---|---|
| `upload_file_to_send`, `replace_file_to_send` | `file_url` | 20 MB (`20971520`) |
| `upload_files_to_send` | `file_url_list` (each file) | 20 MB (`20971520`) |
| `create_faq_documents_from_xlsx` | `file_url`, `.xlsx` | 5 MB (`5242880`) |
| `upload_vector_knowledge_base_xlsx`, `sync_vector_knowledge_base_xlsx` | `file_url`, `.xlsx` | 5 MB (`5242880`) |
| `import_table`, `replace_table` (CSV / Excel) | `body.file_url` | 30 MB |
| `import_vector_documents` | `file_url_list` | — |
| `replace_vector_document_text` | `file_url` | — |
| `send_message_to_test_dialogue_by_id` | `messages[].message_data`: `{data_type: image\|audio\|file, file_url, file_name}` | — |
| `answer_in_dialogue_as_an_employee` | `messages[]`: `{data_type: image\|audio\|file, file_url, file_name}` (attachments not supported in every channel) | — |

Images the bot sends to clients are uploaded as regular Files to Send.

> The file must exist as a local path accessible to the shell. If the user provides a URL (not a local file), download it first with `curl -o /tmp/filename URL` before uploading.

> Temporary uploaded files and their URLs are deleted from storage after **48 hours**.
