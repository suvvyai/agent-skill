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

Use `get_instance_available_variables` to get the list of available variables for a given bot. Additional variables from connected integrations or channels can be found by inspecting dialogue info with `get_dialogue_by_id` / `get_dialogue_messages_by_dialogue_id`.

## Templates in the Instruction (Шаблоны в инструкции)

> When talking to the user, always call this feature **"Шаблоны в инструкции"** (or "Templates"). Do not say "Liquid" — that is the underlying engine name, not the user-facing term.

Enabled by default for every bot (`instruction_settings.use_liquid: true`), set via `update_instance_mcp`. When enabled, the instruction is processed as a template before being sent to the bot — allowing conditional logic based on dialogue variables. The bot never sees the template tags, only the rendered result. When Liquid is turned on for a bot that already has an instruction written in single-brace format, the instruction is auto-converted: `{variable}` placeholders become `{{ variable }}`.

> Whether `use_liquid: false` is accepted to turn it back off may depend on the bot's state — don't assume it always works. If an instruction needs literal `{`/`}` text that shouldn't be parsed as Liquid, test disabling it on that specific bot first rather than relying on this working.

> In template mode, variables use **double braces** `{{ variable }}`, not single braces. Single-brace `{variable}` is the standard non-template format and does not work in template mode.

**When to use:** when a single bot serves multiple channels or contexts and needs different instructions per scenario — e.g., different article codes per marketplace, different tone per channel, different rules on weekdays vs weekends.

**Built-in system variables:**

| Variable | Type | Description |
|---|---|---|
| `instance_name` | string | Bot's name |
| `channel_name` | string | Channel code (e.g., `"telegram_bot"`, `"amocrm"`, `"ozon"`) |
| `current_datetime` | string | Formatted: "Saturday, January 02, 2025 at 16:03+03:00" |
| `current_datetime_iso` | string | ISO 8601 format |
| `current_date` | string | Formatted: "Saturday, January 02, 2025" |
| `current_time` | string | Formatted: "16:03+03:00" |
| `current_timezone` | string | E.g. "UTC+03:00" |
| `now_datetime` | date-time | Native date object, for use with the `date` filter |
| `current_year` | integer | Current year |
| `chat_link` | string | Link to the dialogue in the Suvvy dashboard |
| `instance_max_answer_tokens` | integer | Max tokens available for the bot's response |

> `instance_name`, `current_date`, `current_timezone`, `current_year`, `channel_name` and `instance_max_answer_tokens` don't vary within a single bot across dialogues — using only these (or none) keeps the instruction eligible for prompt caching. Any other variable (including `now_datetime`, `current_datetime`, `current_time`) makes the instruction dialogue-dependent and disables that caching.

Additional variables from channels and integrations are available via `channel_variables` — get them by inspecting the dialogue with `get_dialogue_by_id` / `get_dialogue_messages_by_dialogue_id`.

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
| `date: format` | `{{ now_datetime \| date: "%A" }}` | Format date (e.g., "Monday") |
| `plus: N` / `minus: N` | `{{ price \| plus: 100 }}` | Arithmetic |

Full filter reference: [Python-Liquid2 docs](https://jg-rp.github.io/liquid/).

> **Comparing dates:** Liquid has no native datetime comparison — never compare `now_datetime` directly against a string or another date in `{% if %}`. Convert both sides to a Unix timestamp with `date: "%s"` first and compare the resulting numbers, e.g. `{% if now_datetime | date: "%s" | plus: 0 > 1735689600 %}`. Use `date:` with a display format (like `"%A"`) only for output, never for comparisons.

## Function Calls in Prompts

The bot automatically sees all available functions without them being mentioned in the prompt. However, explicitly describing when to call a function gives the bot a clear action plan and reduces ambiguity.

Recommended format:
- FAQ Document: `If the client asks about X, call the get_file_text("Exact Title") function`
- Vector Knowledge Base / Vector Document search: `If the client needs information about X, call the <function_name>("query") function` — see `references/kb-vector-knowledge-base.md` / `references/kb-vector-document.md` for how the function name is defined
