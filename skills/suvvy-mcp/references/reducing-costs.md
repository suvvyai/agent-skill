# Reducing Dialogue Costs

The platform is pay-as-you-go — cost per dialogue depends primarily on the number of tokens sent to the LLM on each turn.

## Root Cause 1: Instruction Too Long

The system prompt is sent to the LLM on every single turn. A bloated instruction multiplies costs across every message in every dialogue.

- Move factual content out of the instruction and into FAQ Documents — the bot retrieves them only when needed, not on every turn
- Keep the instruction focused on behaviour and logic, not reference data

## Root Cause 2: Dialogue History Too Long

As a dialogue grows, more and more message history is sent to the LLM each turn. Long dialogues become exponentially expensive.

- Set `message_history_settings.type` to `last_messages` or `last_time` instead of `enabled` (full history) to cap the context window (`update_instance_mcp`; pass all three fields: `type`, `last_messages_first_index`, `time_minutes`)
- Save important information gathered during the dialogue into Custom Variables or Memory (`set_memory` step) instead of relying on the bot to "remember" it from a long history — this allows using a shorter context window without losing critical facts

## Common Inefficiency: Excessive KB Calls

If the bot calls many FAQ Documents in sequence, each call includes the full list of all available file titles in the context. With a large knowledge base, this list itself consumes significant tokens and repeats on every call.

Fix: write the instruction so the bot retrieves the right file on the first try. Clear, distinct `title_for_search` values and explicit trigger conditions are the main tools for this.

## FAQ Documents That Are Too Long

Retrieved FAQ Document text is injected into the context in full. Keep FAQ Document text concise — split oversized documents into smaller, more focused ones if needed.

## Tables Returning Too Much Data

When a bot queries a Table, the result is returned in full. If the table is large and the query is broad, the bot receives many irrelevant rows.

Two fixes:
- **Hint the bot in the instruction** to always add a `WHERE` clause that filters by the relevant column. The bot writes the SQL itself but applies the filter because the instruction tells it to.
- **Move the table call into a Custom Tool** (`query_table` step) with a pre-written SQL query that already includes the necessary filters. The bot just calls the tool by name — it never writes SQL.

## Write Instructions and KB in English

English text is processed ~3–4× more efficiently by most LLMs compared to Russian (fewer tokens per word). For Russian-facing bots: write the instruction and FAQ Documents in English, but add "Respond in the user's language" to the instruction.

## Other Levers

- Use a cheaper model when the task doesn't require a powerful one: `llm_code` via `update_instance_llm`, or `set_default_instance_llm` with `preset: "price"` to pick the cheapest available model automatically
- `llm_settings.reasoning_effort: "minimal"` or `"low"` (via `update_instance_llm`) — fewer reasoning tokens for models that support extended thinking
- `merge_message_time_seconds` (`update_instance_mcp`) — merge rapid-fire client messages before responding; avoids one LLM call per message burst
- Working hours (dashboard only) — bot is silent outside working hours; no messages processed = no cost
- `save_function_messages: false` — exclude function call messages from dialogue history
- `parallel_tool_call_limit: 1` (via `update_instance_llm`) — cap tool calls per turn to reduce token usage from parallel calls

**Pricing reference:** Use `get_balance_token_rates` to get the current token pricing for each model.
