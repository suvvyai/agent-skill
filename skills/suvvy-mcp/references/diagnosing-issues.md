# Diagnosing Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Bot doesn't call a function it should | No trigger condition in instruction; function description too vague | Add explicit condition in instruction; improve `tool_description` or `title_for_search` |
| Bot calls the wrong FAQ Document | Similar search titles; `title_for_search` not distinct enough | Rewrite `title_for_search` for both the correct and the incorrectly-called document |
| Bot response doesn't match the expected scenario | Dialogue Logic section incomplete or out of order | Revise Dialogue Logic — one action per step, linked sequentially |
| Poor response style (too formal, too verbose, wrong tone) | Response Style section too vague | Tighten the Response Style section with concrete examples |
| Bot invents information (hallucination) | Facts live in the instruction instead of FAQ Documents | Move factual content to FAQ Documents; add "never invent data" to Restrictions |
| Bot invents data on a forbidden topic despite an explicit restriction in the instruction | At answer time the restriction loses to the bot's urge to give the client information | Create a decoy FAQ Document (подменный прямой вопрос) titled after the topic; its body says the info doesn't exist and what to do instead — see `references/kb-faq-documents.md` |
| Bot answer must never contain X (word, promise, number) | Restriction in the instruction is not enough | Add an Answer Guardrail that regenerates or replaces such answers — see `references/call-conditions.md` |
| Bot ignores a restriction | Restriction buried under other content | Move critical restrictions to a dedicated, clearly labeled section |
| Custom Tool not triggered | Tool is disabled (new tools are created with `is_enabled: false`); trigger condition missing in instruction; attached Call Condition not met; wrong argument types | Enable the tool; add explicit instruction for when to call it; check its `trigger_settings.call_condition_id`; verify argument descriptions; run a webhook step manually with `test_webhook_action` |
| Function called but wrong result | Step logic or variable mapping incorrect | Inspect step variables and `parse_json_variables` in the webhook step |
| Dialogue stops unexpectedly | Control phrase triggered, employee interception, or KB file with "stop dialogue" flag | Find the dialogue in history → Clear context; check `stop_dialogue_patterns` and FAQ Document event settings |
| Dialogue stopped with reason `bot_kicked_from_chat` | The bot was removed from the chat or can't write there anymore (e.g., Bitrix24 excludes the bot when a manager joins; the Telegram user blocked the bot or removed it from the group) | Check integration settings and Open Lines configuration in Bitrix24 |
