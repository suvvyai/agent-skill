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

The instruction supports dynamic variables substituted with real values each turn. Write them in `{variable}` format directly in the instruction text.

Examples:
- `Client name — {name}`
- `Client phone number — {client_phone}`
- `Current date and time — {current_datetime}`

Use `get_instance_available_variables` to get the list of available variables for a given bot. Additional variables from connected integrations or channels can be found by inspecting dialogue info with `get_dialogue_by_id`.

## Templates in the Instruction (Шаблоны в инструкции)

> When talking to the user, always call this feature **"Шаблоны в инструкции"** (or "Templates"). Do not say "Liquid" — that is the underlying engine name, not the user-facing term.

Enable via `instruction_settings.use_liquid: true` in `update_instance_settings`. When enabled, the instruction is processed as a template before being sent to the bot — allowing conditional logic based on dialogue variables. The bot never sees the template tags, only the rendered result. Currently in beta.

> In template mode, variables use **double braces** `{{ variable }}`, not single braces. Single-brace `{variable}` is the standard non-template format and does not work in template mode.

**When to use:** when a single bot serves multiple channels or contexts and needs different instructions per scenario — e.g., different article codes per marketplace, different tone per channel, different rules on weekdays vs weekends.

**Built-in system variables:**

| Variable | Type | Description |
|---|---|---|
| `channel_name` | string | Channel code (e.g., `"telegram_bot"`, `"amocrm"`, `"ozon"`) |
| `current_datetime` | string | Formatted: "Saturday, January 02, 2025 at 16:03+03:00" |
| `current_datetime_iso` | string | ISO 8601 format |
| `current_datetime2` | date-time | Native date object, for use with `date` filter |
| `current_year` | integer | Current year |
| `chat_link` | string | Link to the dialogue in the Suvvy dashboard |
| `instance_max_answer_tokens` | integer | Max tokens available for the bot's response |

Additional variables from channels and integrations are available via `channel_variables` — get them by inspecting the dialogue with `get_dialogue_with_messages_by_id`.

**Conditionals:**

```liquid
{% if channel_name == "ozon" %}
Article codes for Ozon: OZ123, OZ456
{% elsif channel_name == "wildberries" %}
Article codes for Wildberries: WB124954309
{% else %}
Use the default article list.
{% endif %}
```

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
| `date: format` | `{{ current_datetime2 \| date: "%A" }}` | Format date (e.g., "Monday") |
| `plus: N` / `minus: N` | `{{ price \| plus: 100 }}` | Arithmetic |

Full filter reference: [Python-Liquid2 docs](https://jg-rp.github.io/liquid/).

## Function Calls in Prompts

The bot automatically sees all available functions without them being mentioned in the prompt. However, explicitly describing when to call a function gives the bot a clear action plan and reduces ambiguity.

Recommended format:
- FAQ Document: `If the client asks about X, call the get_file_text("Exact Title") function`
- Big Document search: `If the client needs information about X, call the search_in_knowledge_base("query") function`
