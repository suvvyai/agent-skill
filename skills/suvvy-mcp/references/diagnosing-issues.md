# Diagnosing Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Bot doesn't call a function it should | No trigger condition in instruction; function description too vague | Add explicit condition in instruction; improve `tool_description` or `title_for_search` |
| Bot calls the wrong FAQ Document | Similar search titles; `title_for_search` not distinct enough | Rewrite `title_for_search` for both the correct and the incorrectly-called document |
| Bot response doesn't match the expected scenario | Dialogue Logic section incomplete or out of order | Revise Dialogue Logic — one action per step, linked sequentially |
| Poor response style (too formal, too verbose, wrong tone) | Response Style section too vague | Tighten the Response Style section with concrete examples |
| Bot invents information (hallucination) | Facts live in the instruction instead of FAQ Documents | Move factual content to FAQ Documents; add "never invent data" to Restrictions |
| Bot ignores a restriction | Restriction buried under other content | Move critical restrictions to a dedicated, clearly labeled section |
| Custom Tool not triggered | Trigger condition missing in instruction; wrong argument types | Add explicit instruction for when to call the tool; verify argument descriptions |
| Function called but wrong result | Step logic or variable mapping incorrect | Inspect step variables and `parse_json_variables` in the webhook step |
| Dialogue stops unexpectedly | Control phrase triggered, employee interception, or KB file with "stop dialogue" flag | Find the dialogue in history → Clear context; check `stop_dialogue_patterns` and FAQ Document event settings |
| `bot_kicked_from_chat` error | Integration conflict (e.g., Bitrix24 excludes bot when a manager joins) | Check integration settings and Open Lines configuration in Bitrix24 |
