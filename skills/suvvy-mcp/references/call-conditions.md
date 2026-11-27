# Call Conditions and Answer Guardrails

## Call Conditions

A **Call Condition** is a separate, reusable object on the bot that answers "should this fire right now?". It is referenced by ID from:
- **Custom Tool auto-triggers** — `trigger_settings.call_condition_id` (see `references/custom-tools.md`)
- **Follow-up events** — `scheduled_event.call_condition_id` (see `references/follow-ups.md`)
- **Answer Guardrails** — `call_condition_id`, required (see below)

### Tools

| Tool | Purpose |
|---|---|
| `get_call_condition_schema` | JSON schema of one condition by `condition_type` — build every condition from it |
| `create_call_condition` | Create: `instance_id`, `title`, `groups` |
| `update_call_condition` | Change `title` and/or `groups` (by `condition_id`); `groups` replace the previous ones entirely |
| `get_call_condition_list` / `get_call_condition` | Read conditions of a bot / one condition |
| `delete_call_condition` | Delete |

### Structure and logic

`groups` is a list of groups, each with a `condition_list`. **Groups are combined with AND; conditions inside one group are combined with OR.** There is no other way to choose AND/OR — to express "A and (B or C)", put A in one group and B, C in another.

Each condition is an object `{"type": "<condition type>", "operator": ..., "value": ...}` shaped by `get_call_condition_schema` for that type. Operators are `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `in`, `nin`, but each type allows only some of them — take them from the schema.

### Condition types

| `type` | Checks |
|---|---|
| `function_called` | A specific function was called this turn (`eq`/`ne`, value = function name) |
| `document_called` | A specific FAQ Document was retrieved (`eq`/`ne`) |
| `incoming_message_phrase` | Phrase in the client's or employee's message |
| `ai_message_phrase` | Phrase in the bot's answer |
| `variable` | A Custom Variable (`key`) compared with `value` |
| `call_time` | Time of day `HH:MM` on the bot's clock, any day (`gt`/`gte`/`lt`/`lte`) |
| `call_datetime` | Absolute date and time on the bot's clock, without time zone |
| `channel_name` | The dialogue's channel (`eq`/`ne`) |
| `llm_call_instruction` | Natural-language condition checked by an LLM: `call_instruction`, plus `add_function_calls`, `use_instance_history_type` |
| `ai_message_has_number` | The bot's answer contains a number of the given length |
| `incoming_message_with_content_type` | Incoming message is `text`, `file`, `audio` or `image` |
| `dialogue_customer_message_count` | Client message count reaches N (`eq` only — fires on the turn the counter reaches N, not "more than N") |
| `dialogue_ai_message_count` | Bot message count reaches N (`eq` only, same semantics) |
| `dialogue_token_cost` | Dialogue cost in tokens reaches N (`eq` only, fires once) |

## Answer Guardrails (Prediction Guardrails)

A guardrail checks the bot's answer **before it is sent**. When its Call Condition is met, the answer is regenerated or replaced.

| Tool | Purpose |
|---|---|
| `create_instance_prediction_guardrail` | Create: `instance_id`, `title`, `call_condition_id` (required), `action`, `is_enabled` (default `true`) |
| `update_instance_prediction_guardrail` | Change a guardrail |
| `get_instance_prediction_guardrail_list` / `get_instance_prediction_guardrail` | Read |
| `sort_instance_prediction_guardrail_list` | Set the order — `guardrail_id_list` with **all** guardrail IDs of the bot, no gaps or duplicates |
| `delete_instance_prediction_guardrail` | Delete |

**`action` types:**
- `regenerate` — the bot rewrites its answer with a `hint` (up to `max_regenerate_count` times per turn, 1–3); `final_action` decides what happens when attempts run out: send a prepared `message`, `call_manager`, `stop_dialogue`
- `replace` — the answer is replaced with a prepared `message`; optionally `call_manager`, `stop_dialogue`

Typical setup: create a Call Condition (e.g. `ai_message_phrase` with a forbidden word, or `llm_call_instruction` "the answer promises a discount"), then create a guardrail that references it.
