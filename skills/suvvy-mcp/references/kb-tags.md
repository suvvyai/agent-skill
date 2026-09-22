# Knowledge Tags

Knowledge Tags are labels that can be attached to **FAQ Documents**. When the bot retrieves a tagged document during a dialogue, those tags are automatically associated with that dialogue. Tags are used purely for analytics: they let you track what topics clients actually asked about.

> Vector Knowledge Base / Vector Document entries (see `references/kb-vector-knowledge-base.md`, `references/kb-vector-document.md`) do not support tags — only FAQ Documents do.

**Example:** Create a tag "Interested in pricing" and attach it to the "Prices" FAQ Document. After a month you can see in analytics how many dialogues had price-interested clients vs. empty dialogues with no retrieved documents.

Tags are configured and created independently, then linked to FAQ Documents. Besides `title`, a tag also has `color` and an (deprecated) `emoji_icon` field.

**Management tools:** `create_knowledge_tag`, `get_knowledge_tags`, `get_knowledge_tag`, `update_knowledge_tag`, `delete_knowledge_tag`.
