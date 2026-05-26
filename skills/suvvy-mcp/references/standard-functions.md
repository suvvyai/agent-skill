# Standard Functions

Standard Functions are built-in callable functions that can be enabled on any bot without creating a Custom Tool. Once enabled, the bot can call them directly based on the conversation context.

| Function | What it does | `update_instance` parameter |
|---|---|---|
| **Stop dialogue** | Bot stops responding in this dialogue; a human employee takes over | `stop_dialogue` |
| **Ignore message** | Bot ignores the triggering message and sends no reply | `ignore_message` |
| **Set dialogue tag** | Bot tags the dialogue with a label (for filtering/reporting) | `set_dialogue_tag` |
| **Call manager** | Sends a notification to the manager's Telegram when called | `call_manager` |

Each standard function can be enabled/disabled via its `is_enabled` field and given a custom `description` that the bot uses to decide when to call it. For `set_dialogue_tag`, also configure `tag_list` (list of Knowledge Tag IDs the bot can apply).

Enable/disable in **Доп. настройки → Стандартные функции**. Add explicit trigger conditions in the instruction so the bot knows when to call each one.

## Reminder Settings

- `reminder_settings.add_reminder_list_to_instruction` (default: `true`) — include the list of active Follow-Ups in the bot's context so it can reference upcoming reminders during the dialogue.
- `reminder_settings.cancel_reminders` — configure the built-in cancel-reminders standard function: `is_enabled` and `description`.

## Message Saving & Inactive State

- `save_messages_if_inactive` — save incoming messages to dialogue history even when the bot is paused/inactive.
- `send_messages_after_inactive` — when the bot resumes activity, send the scheduled messages that accumulated during the inactive period.
- `schedule_messages_activation_use_instance_model` — use the bot's main LLM model (not the default) when generating scheduled message content.
- `schedule_messages_without_predict` — send scheduled messages as fixed text without generating a new LLM response.

## Scheduled Event Groups Wiring

Connect bot-level Follow-Up groups to dialogue events via:
- `scheduled_event_groups_after_instance` — list of group IDs to trigger after every bot message
- `scheduled_event_groups_after_employee` — list of group IDs to trigger after every employee message
- `scheduled_event_work_days` — separate work schedule controlling when scheduled event groups are allowed to fire (same format as `work_days`)
