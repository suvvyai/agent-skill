# Standard Functions

Standard Functions are built-in callable functions that can be enabled on any bot without creating a Custom Tool. Once enabled, the bot can call them directly based on the conversation context.

| Function | What it does | `update_instance_mcp` parameter |
|---|---|---|
| **Stop dialogue** | Bot stops responding in this dialogue; a human employee takes over | `stop_dialogue` |
| **Ignore message** | Bot ignores the triggering message and sends no reply | `ignore_message` |
| **Set dialogue tag** | Bot tags the dialogue with a label (for filtering/reporting) | `set_dialogue_tag` |
| **Call manager** | Sends a notification to the manager's Telegram when called | `call_manager` |
| **Add to blacklist** | Adds the client to the blacklist | `add_to_blacklist` |

Each standard function can be enabled/disabled via its `is_enabled` field and given a custom `description` that the bot uses to decide when to call it. For `set_dialogue_tag`, also configure `tag_list` (list of Knowledge Tag IDs the bot can apply). `stop_dialogue` additionally has `disable_auto_resume` — when the bot stops the dialogue itself, it is not resumed automatically.

Add explicit trigger conditions in the instruction so the bot knows when to call each one.

## Reminder Settings

- `reminder_settings.add_reminder_list_to_instruction` (default: `true`) — include the list of active Follow-Ups in the bot's context so it can reference upcoming reminders during the dialogue.
- `reminder_settings.cancel_reminders` — configure the built-in cancel-reminders standard function: `is_enabled` and `description`.

## Message Saving & Inactive State

- `save_messages_if_inactive` — save incoming messages to dialogue history even when the bot is paused/inactive.
- `send_messages_after_inactive` — when the bot becomes active again, reply to the messages that arrived while it was inactive.
- `schedule_messages_activation_use_instance_model` — use the bot's own model (instead of the default one) to check Follow-Up trigger conditions.
- `schedule_messages_without_predict` — the bot does **not** reply to the message at all; it only schedules Follow-Ups.

## Scheduled Event Groups Wiring

Connect bot-level Follow-Up groups to dialogue events via:
- `scheduled_event_groups_after_instance` — list of group IDs to trigger after every bot message
- `scheduled_event_groups_after_employee` — list of group IDs to trigger after every employee message

Groups themselves are created with the follow-up group tools — see `references/follow-ups.md`.

The follow-up working schedule (used by events with `only_working_time: true`) is **not available via MCP** — configure it in the dashboard.
