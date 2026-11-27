# Knowledge Tags

Knowledge Tags are labels that can be attached to **FAQ Documents**. When the bot retrieves a tagged document during a dialogue, those tags are automatically associated with that dialogue. Tags are used purely for analytics: they let you track what topics clients actually asked about.

> Vector Knowledge Base / Vector Document entries (see `references/kb-vector-knowledge-base.md`, `references/kb-vector-document.md`) do not support tags — only FAQ Documents do.

**Example:** Create a tag "Interested in pricing" and attach it to the "Prices" FAQ Document. After a month you can see in analytics how many dialogues had price-interested clients vs. empty dialogues with no retrieved documents.

Tags are created independently, then linked to FAQ Documents via `faq_document.tags` (tag IDs) in `create_faq_document` / `update_faq_document` — in an update, the list replaces the previous one entirely. Tag fields: `title`, `description`, `color` (CSS color name, hex or rgb; random if omitted). `update_knowledge_tag` takes the changes in a `tag` object.

Tags can also be set on a dialogue by the `set_dialogue_tag` standard function and by Custom Tools (`tag_list`), and dialogues can be filtered by them (`get_dialogue_list`, `tags`).

**Management tools:** `create_knowledge_tag`, `get_knowledge_tags`, `get_knowledge_tag`, `update_knowledge_tag`, `delete_knowledge_tag`.
