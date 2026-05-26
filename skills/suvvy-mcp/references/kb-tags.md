# Knowledge Tags

Knowledge Tags are labels that can be attached to **FAQ Documents** and **Big Documents**. When the bot retrieves a tagged document during a dialogue, those tags are automatically associated with that dialogue. Tags are used purely for analytics: they let you track what topics clients actually asked about.

**Example:** Create a tag "Interested in pricing" and attach it to the "Prices" FAQ Document. After a month you can see in analytics how many dialogues had price-interested clients vs. empty dialogues with no retrieved documents.

Tags are configured and created independently, then linked to FAQ Documents and Big Documents.

**Management tools:** `create_knowledge_tag`, `get_knowledge_tags`, `update_knowledge_tag`, `delete_knowledge_tag`.
