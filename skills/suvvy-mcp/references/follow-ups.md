# Follow-Ups

## Follow-Ups (Scheduled Messages)

A Follow-Up is a message scheduled to be sent to a client at a future time. It is planned automatically at the moment the triggering source is invoked, and fires when the scheduled time arrives.

All follow-ups are built from **Scheduled Event Groups**: a group is an ordered list of events, each with a timing and an action. Groups are then attached to a trigger.

**Where groups are attached:**
- **Bot level** — after every bot message or employee message (`update_instance_mcp`: `scheduled_event_groups_after_instance` / `scheduled_event_groups_after_employee`)
- **FAQ Document** — `faq_document.events.scheduled_event_groups` (list of group IDs) in `create_faq_document` / `update_faq_document`; the group runs the moment the bot retrieves that document
- **Custom Tool** — the `add_reminder` step schedules a one-off follow-up (see Dynamic Follow-ups below)

> There is no retrieval-triggered follow-up on Vector Knowledge Base / Vector Document entries — only FAQ Documents support it.

**How it works (FAQ Document example):** A client asks about pricing → the bot retrieves the FAQ Document with prices → the system schedules the document's group → if the client doesn't reply within the configured time, the follow-up message is sent as a reminder.

**Auto-cancellation (group events):** pending events of Scheduled Event Groups are cancelled when the client sends a message. An employee message cancels them too, unless the group has `keep_on_employee_message: true`. Reminders created by the `add_reminder` step are **not** auto-cancelled — cancel them explicitly (see Dynamic Follow-ups below).

## Managing Groups via MCP

| Tool | Purpose |
|---|---|
| `create_scheduled_event_group` | Create a group: `instance_id`, `name`, `keep_on_employee_message`, and its **first** event in `scheduled_event` |
| `update_scheduled_event_group_add_event` | Append another event to the end of a group |
| `update_scheduled_event` | Change one event (by `scheduled_event_id`); `action` and `time` are replaced entirely |
| `update_scheduled_event_group_remove_event` | Delete one event |
| `update_scheduled_event_group_reorder_events` | Set the order — `event_id_list` with **all** event IDs of the group, no gaps or duplicates |
| `update_scheduled_event_group` | Rename the group or change `keep_on_employee_message` |
| `get_scheduled_event_group` / `get_scheduled_event_group_list` | Read groups. The list can be filtered (one filter per call): `after_instance_only`, `after_employee_only`, or `faq_document_id` |
| `delete_scheduled_event_group` | Delete a group |

Creating a group does **not** attach it — wire it to the bot or a FAQ Document as described above.

## Event Settings

**Timing (`time`, by `mode`):**
- `absolute_delay` — `delay_minutes` after the group started or after the previous event
- `after_days_at_time` — `after_days` (0 = today if the time hasn't passed yet, otherwise tomorrow) at `at_time` (`HH:MM`, bot's time zone)
- `schedule` — repeating weekly schedule: all keys `Mon`…`Sun` are required (lists of `HH:MM`, a list may be empty), at least one time overall, runs no more than once an hour. **Such an event must be the only event in its group**

**Action (`action`, by `type`):**

| `type` | What happens |
|---|---|
| `send_message` | Sends fixed text `message_text` |
| `generate_message` | A message is generated from `instruction_text`; optional own `history_settings` (same shape as `message_history_settings`) |
| `predict_message` | The bot answers as usual, with an additional `instruction_text` for this answer |
| `system_predict_message` | The bot answers as usual, without an additional instruction |
| `read_faq_document` | Retrieves the FAQ Document `faq_document_id` (same bot) |
| `custom_tool_call` | Runs Custom Tool `custom_tool_id` (same bot, must have auto-trigger configured); `call_bot: true` makes the bot answer afterwards |
| `scheduled_event_group_run` | Starts another group `scheduled_event_group_id` (that group must not itself start groups) |

`instruction_text` of `generate_message` is a template — variables `{{ name }}` and `{% if %}` work (see `references/writing-prompts.md`).

**Other event fields:**
- `name` — required, the event's title
- `call_condition_id` — the event fires only if this Call Condition is met (see `references/call-conditions.md`); this is how "send only if…" logic, including natural-language LLM conditions (`llm_call_instruction`), is configured. Only `variable`, `call_time`, `call_datetime`, `channel_name` and `llm_call_instruction` conditions are accepted here
- `call_in_dialogue_limit` — how many times the event may fire in one dialogue (`null` = unlimited)
- `only_working_time` — fire only during the bot's working hours (the follow-up schedule itself is dashboard-only)

**Chain follow-ups** — several events in one group with different timings (`absolute_delay` / `after_days_at_time`) create a drip sequence; each event's condition is checked independently.

## Dynamic Follow-ups

Dynamic Follow-ups are follow-ups where the send time is calculated **relative to a specific event date** extracted from the conversation — not a fixed interval from the triggering action. They are created by the `add_reminder` Custom Tool step (fetch its schema with `get_custom_tool_action_schema`):
- `date` — the anchor date/time (usually a Custom Tool argument)
- `timedelta_minutes_for_run` — offset from that date, −30 to +30 days in minutes (e.g. `-1440` = one day before)
- `action` — same action types as group events
- `description` — how the reminder is described to the bot

**Example:** A client books an appointment for Friday at 14:00. Two `add_reminder` steps with offsets `-1440` and `-60` send reminders 1 day and 1 hour before.

These reminders are not cancelled by a client message — only by the `cancel_reminders` step (and the `cancel_reminders` standard function). In a live dialogue, list pending reminders with `get_active_reminder_list_by_dialogue_id` and cancel them with `cancel_reminders_in_dialogue`. Pending group events are a separate list — `get_scheduled_messages_for_dialogue_by_dialogue_id`; `cancel_reminders_in_dialogue` does not cancel them.

Use dynamic follow-ups for appointments, deadlines, subscription renewals — any scenario where reminder timing must align with a client-specific date.
