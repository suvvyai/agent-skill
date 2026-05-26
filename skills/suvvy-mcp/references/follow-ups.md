# Follow-Ups

## Follow-Ups (Scheduled Messages)

A Follow-Up is a message scheduled to be sent to a client at a future time. It is planned automatically at the moment the triggering source is invoked, and fires when the scheduled time arrives.

**Where Follow-Ups are configured:**
- **Custom Tool** — as a dedicated step type inside a Custom Tool
- **FAQ Document** — as a separate setting on the document (not in the text); the follow-up is scheduled the moment the bot retrieves that file
- **Big Document** — same as FAQ Document: a separate setting, scheduled on retrieval

**How it works (FAQ Document example):** A client asks about pricing → the bot retrieves the FAQ Document with prices → the system simultaneously schedules a follow-up → if the client doesn't reply within the configured time, the follow-up message is sent as a reminder.

**Auto-cancellation:** A follow-up is automatically cancelled if the client sends any message before it fires.

**Follow-up message types:**
- **Fixed text** — a static predefined message
- **Bot-generated** — the bot writes the message based on an additional instruction
- **LLM-generated** — generated directly by the LLM
- **KB file call** — retrieves and sends an FAQ Document
- **Action call** — triggers an auto-trigger Custom Tool

**LLM condition** — an optional natural-language condition evaluated before sending; the follow-up only fires if the condition is met (e.g., "only if the client hasn't replied yet").

**Chain follow-ups** — multiple entries with different timings create a drip sequence. Each step's LLM condition is evaluated independently.

## Dynamic Follow-ups

Dynamic Follow-ups are follow-ups where the send time is calculated **relative to a specific event date** extracted from the conversation — not a fixed interval from the triggering action.

**Example:** A client books an appointment for Friday at 14:00. Dynamic follow-ups are configured as "1 day before" and "1 hour before" — both calculated from the booked appointment date extracted during the conversation.

**Key differences from regular Follow-Ups:**
- Timing anchors to a named date/time value (passed as a Custom Tool argument)
- Multiple reminders can reference the same event at different relative offsets
- Message types are the same: fixed text, bot-generated, LLM-generated, KB file call, action call

Use dynamic follow-ups for appointments, deadlines, subscription renewals — any scenario where reminder timing must align with a client-specific date.

## Scheduled Event Groups (Bot-Level Follow-Ups)

Scheduled Event Groups are bot-level collections of Follow-Up messages that fire automatically when a client does not respond after a bot or employee message. They are configured once on the bot and apply globally — unlike FAQ Document Follow-Ups, which are tied to a specific document's retrieval.

**Two trigger types:**
- **After agent message** — fires when the client doesn't reply to the bot
- **After employee message** — fires when the client doesn't reply to a human employee

**How groups work:** Each group contains one or more Follow-Up messages with timing and content settings. Multiple groups can be created and assigned to each trigger type. A "Расписание" (Schedule) tab controls when follow-ups are allowed to send (e.g., only during working hours). The "Все группы" tab lists all groups across the bot.

**Key difference from document-level Follow-Ups:** Document Follow-Ups fire on retrieval of a specific FAQ or Big Document. Scheduled Event Groups fire on the entire conversation's inactivity pattern, regardless of which documents were retrieved.
