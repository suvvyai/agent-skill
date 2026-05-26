# Uploading Files

The MCP server cannot upload files directly. Any operation that requires a file (importing Big Documents, FAQ Documents, Tables, uploading Files to Send, Images, or attachments in the test chat) uses a two-step presigned upload workflow.

## Step 1 — Get a Presigned URL

Call `get_presigned_upload_url` with the filename. The response contains:
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

Include **all** fields from `upload_fields` as `-F` flags, then add the file last as `file=@/path`. A successful upload returns HTTP 204.

## Step 3 — Pass `file_url` to the Platform

After the upload, use `file_url` from Step 1 in the target MCP tool (e.g., `import_big_documents`, `create_faq_documents_from_xlsx`, `import_table`, `upload_file_to_send`, `upload_images`, etc.).

> The file must exist as a local path accessible to the shell. If the user provides a URL (not a local file), download it first with `curl -o /tmp/filename URL` before uploading.

> Temporary uploaded files and their URLs are deleted from storage after **48 hours**.
