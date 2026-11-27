# Writing Bot System Prompts

Structure every system prompt into these sections (in order):

| Section | Purpose |
|---|---|
| **Role** | Who the bot is and the company context |
| **General Information** | What the company does |
| **Goals and Objectives** | What the bot must accomplish |
| **Greeting** | How to open conversations |
| **Response Language** | Default: respond in the user's language |
| **Response Style** | Tone (default: friendly, natural, polite) |
| **Dialogue Logic** | Step-by-step interaction flow |
| **Working with Functions** | When and how to call knowledge base or custom tools |
| **Restrictions** | What the bot must never do |
| **Important Clarifications** | Anything that doesn't fit other sections |

**Writing rules:**
- Use imperative mood, second person: "Say hello", "Ask the client", "Call the function"
- Never duplicate information across sections
- Factual reference data (prices, addresses, FAQs) belongs in FAQ Documents, not the prompt
- Each dialogue step must be a single actionable instruction, logically linked to the previous

## Instruction Variables

The instruction is always processed as a template (Liquid syntax) before each turn: variables are substituted with real values, and the bot sees only the rendered result. Write variables in **double braces**:

- `Client name — {{ name }}`
- `Current date and time — {{ current_datetime }}`

> Single braces `{variable}` are **not** substituted in the instruction — they stay in the prompt as literal text. Always use `{{ variable }}`. To output literal `{{` / `{%`, wrap the text in `{% raw %}…{% endraw %}`.

Use `get_instance_available_variables` to get the variables available for a given bot: system variables, per-channel variables (`base`, `lead`, `deal`, `contact`, `company`, `product`, `review`, `question`) and the bot's Custom Variables. In the template they are all plain names: `{{ name }}`.

The same template syntax works in other text fields: `structured_answer.chat_instruction`, the Custom Variables block titles (`update_custom_variable_settings`), voice `start_message` / `start_message_instruction`, `instruction_text` of `generate_message` follow-ups (group events and `add_reminder` steps) and string `trigger_settings.argument_values` of auto-triggered Custom Tools. A syntax error in a template is rejected with `INVALID_LIQUID_SYNTAX`.

## Templates in the Instruction (Шаблоны в инструкции)

> When talking to the user, always call this feature **"Шаблоны в инструкции"** (or "Templates"). Do not say "Liquid" — that is the underlying engine name, not the user-facing term.

Templates are always on — there is no setting to enable or disable them. Beyond plain variables they allow conditional logic based on dialogue variables; the bot never sees the template tags, only the rendered result.

**When to use:** when a single bot serves multiple channels or contexts and needs different instructions per scenario — e.g., different article codes per marketplace, different tone per channel, different rules on weekdays vs weekends.

**Built-in system variables:**

| Variable | Type | Description |
|---|---|---|
| `instance_name` | string | Bot's name |
| `channel_name` | string | Channel code (e.g., `"telegram_bot"`, `"amocrm"`, `"ozon_chat"`) |
| `current_datetime` | string | Formatted: "Saturday, January 02, 2025 at 16:03+03:00" |
| `current_datetime_iso` | string | ISO 8601 format |
| `current_date` | string | Formatted: "Saturday 2025-01-02" |
| `current_time` | string | Formatted: "16:03+03:00" |
| `current_timezone` | string | E.g. "UTC+03:00" or an IANA name like "America/Chicago" |
| `now_datetime` | date-time | Native date object, for use with the `date` filter |
| `current_year` | integer | Current year |
| `chat_link` | string | Link to the dialogue in the Suvvy dashboard |
| `dialogue_source` | string | Dialogue source as shown in the dashboard: "Name (username) \| ID: 123" |
| `instance_max_answer_tokens` | integer | Max tokens available for the bot's response |

> `instance_name`, `current_date`, `current_timezone`, `current_year`, `channel_name` and `instance_max_answer_tokens` don't vary within a single bot across dialogues — using only these (or none) keeps the instruction eligible for prompt caching. Any other variable (including `now_datetime`, `current_datetime`, `current_time`) makes the instruction dialogue-dependent and disables that caching.

Variables of the bot's connected channels (including CRM channels) are listed by `get_instance_available_variables` and used as plain names (`{{ lead_name }}`, not `channel_variables.lead_name`).

To test template branches in the test chat, pass `fake_channel` together with `channel_variables` to `send_message_to_test_dialogue_by_id`. `fake_channel` alone switches the channel's instructions and functions, but the `channel_name` variable stays `test_chat` — if the template branches on `channel_name`, also pass it in `channel_variables` (`{"channel_name": "ozon_chat"}`). `channel_variables` are applied only when `fake_channel` is set.

**Conditionals:**

```liquid
{% if channel_name contains "ozon" %}
Article codes for Ozon: OZ123, OZ456
{% elsif channel_name contains "wildberries" %}
Article codes for Wildberries: WB124954309
{% else %}
Use the default article list.
{% endif %}
```

Marketplace channels have separate codes per message kind (`ozon_chat`, `ozon_review`, `ozon_question`, `wildberries_review`, `wildberries_question`, `yandexmarket_chat`, `yandexmarket_review`) — there is no plain `ozon` / `wildberries` code, so compare with `contains` or with the exact code.

**Case/switch** — cleaner for multiple values of the same variable:

```liquid
{% case channel_name %}
  {% when "telegram_bot" %}  Respond with emojis and short messages.
  {% when "amocrm" %}        Formal tone, no emojis.
  {% else %}                 Standard style.
{% endcase %}
```

**Assign** — store a reusable value within the template:

```liquid
{% assign greeting = "Hello" %}
{{ greeting }}, {{ name }}!
```

**Comments** — removed before the instruction reaches the bot:

```liquid
{# This section handles marketplace-specific product codes #}
```

**Filters** — transform variable values inline using `|`:

| Filter | Example | Result |
|---|---|---|
| `capitalize` | `{{ name \| capitalize }}` | First letter uppercase only |
| `upcase` / `downcase` | `{{ name \| upcase }}` | All caps / all lowercase |
| `default: value` | `{{ email \| default: "unknown" }}` | Fallback if variable is empty |
| `strip` | `{{ name \| strip }}` | Remove surrounding whitespace |
| `truncate: N` | `{{ text \| truncate: 50 }}` | Trim to N chars with "..." |
| `truncatewords: N` | `{{ text \| truncatewords: 10 }}` | Trim to N words |
| `date: format` | `{{ now_datetime \| date: "%A" }}` | Format date (e.g., "Monday") |
| `plus: N` / `minus: N` | `{{ price \| plus: 100 }}` | Arithmetic |

Full filter reference: [Python-Liquid2 docs](https://jg-rp.github.io/liquid/).

> **Comparing dates:** Liquid has no native datetime comparison — never compare `now_datetime` directly against a string or another date in `{% if %}`. Convert both sides to a Unix timestamp with `date: "%s"` first and compare the resulting numbers, e.g. `{% if now_datetime | date: "%s" | plus: 0 > 1735689600 %}`. Use `date:` with a display format (like `"%A"`) only for output, never for comparisons.

## Function Calls in Prompts

The bot automatically sees all available functions without them being mentioned in the prompt. However, explicitly describing when to call a function gives the bot a clear action plan and reduces ambiguity.

Recommended format:
- FAQ Document: `If the client asks about X, call the get_file_text("Exact Title") function`
- Vector Knowledge Base / Vector Document search: `If the client needs information about X, call the <function_name>("query") function` — see `references/kb-vector-knowledge-base.md` / `references/kb-vector-document.md` for how the function name is defined
