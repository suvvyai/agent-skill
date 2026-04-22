---
name: suvvy-mcp
description: Use when managing the Suvvy bot platform — creating or configuring bots, knowledge bases (FAQ Documents, Big Documents), channels, custom tools, or writing and reviewing bot system prompts via the Suvvy MCP server.
---

# Suvvy MCP

## Overview

Suvvy is a platform for creating LLM-powered chatbots (**Bots**) that connect to messaging channels and communicate with clients. Each bot has a system prompt, a knowledge base, channel integrations, and optional custom tools (actions).

**Requirement:** All Suvvy management is done through the **Suvvy MCP server**. If it is not configured in your environment, refer to the documentation: `https://docs.suvvy.ai`

> Throughout this skill, "see MCP" or "available via MCP" means: consult the relevant MCP tool schema directly — tool descriptions and argument definitions are the authoritative source for full parameter details.

## Terminology

| Concept | Primary Term | Code / MCP Term | Russian | Aliases / Abbreviations |
|---|---|---|---|---|
| Main entity | **Bot** | `instance` | Бот, Агент | Agent |
| Knowledge base | **Knowledge Base** | — | База знаний | KB, БЗ |
| Knowledge base entry (direct) | **FAQ Document** | `faq_document` | Прямой вопрос | Direct Question, ПВ |
| Knowledge base entry (semantic) | **Big Document** | `big_document` | Большой файл | Large File, БФ |
| Knowledge base entry (structured) | **Table** | `table` | Таблица | — |
| Callable action | **Custom Tool** | `custom_tool` | Кастомное действие, Действие, Воркфлоу | Action, Workflow, КД |
| Communication surface | **Channel** | `channel` | Канал | — |
| Pre-built connector | **Integration** | `integration` | Интеграция | — |
| Client chat session | **Dialog** | `dialog` | Диалог | Dialogue |
| Sub-agent bot | **Subordinate Bot** | — | Подчиненный бот | Slave bot |
| Scheduled outbound message | **Follow-Up** | — | Фоллоу Ап, Отложенное сообщение | Ping, Scheduled Message |

> In MCP tool names and API parameters, always use the code/MCP term (e.g., `instance_id`, `faq_document`).

## Core Concepts

### Bots (Instances)

A bot is the central entity on the platform. Each bot has:
- A **system prompt** (also called **Instruction**) — defines behavior, tone, and dialogue logic
- A **knowledge base** — FAQ Documents, Big Documents, and/or Tables
- **Channels** — where clients interact (messengers, chat widgets, etc.)
- **Integrations** — pre-built connectors available on the platform; when attached to a bot, they add tools that let the bot interact with external applications (CRMs, booking systems, etc.)
- **Custom Tools** — optional callable actions

### Functions

Every bot has a unified list of callable functions. The bot can call any function from this list in accordance with its instruction. Functions come from four sources:

- **Knowledge base** — `get_file_text` (FAQ Documents), `search_in_knowledge_base` (Big Documents), and per-table functions (Tables)
- **Custom Tools** — manually configured actions
- **Channels** — some channel integrations expose their own functions
- **Integrations** — pre-built connectors add their own functions (CRM, booking, etc.)

### Knowledge Base

Suvvy supports three knowledge base types that can run simultaneously on the same bot.

#### FAQ Documents (Direct Questions)

- Each file has a **title** and a **text body**
- At runtime the bot sees **only the list of titles** — it decides which file to retrieve
- On retrieval the bot receives the full text, which can contain answer text, instructions, or function calls
- Best for: specific intents, structured answers, branching instructions triggered by user phrasing
- **MCP retrieval function:** `get_file_text("Exact Title")`

#### Big Documents

- Each file has a title and configurable **chunking settings**
- Chunks are converted to **embeddings**; the bot never sees individual chunks or file titles directly
- The bot issues a **semantic text query** and receives relevant passages in return
- Big Documents are usually not written from scratch — they are uploaded from existing files (DOCX, PDF, and other formats; supported formats are listed in the relevant MCP tool schema). This makes it easy to give a bot access to internal documentation, manuals, books, or any structured knowledge source without manual rewriting.
- Best for: large unstructured content — internal docs, product manuals, policy documents, long-form articles
- **MCP search function:** `search_in_knowledge_base("natural language query")`

#### Tables

- Uploaded from CSV or XLSX files
- The bot queries a table by writing a **SQL query** — the result is returned as structured data
- By default each table gets its **own dedicated function** that the bot can call directly
- Alternatively, the table's dedicated function can be disabled and the query embedded in a **Custom Tool** instead — in this case the Custom Tool executes a pre-configured SQL query and the bot simply calls the action without writing SQL itself
- Best for: structured data — price lists, product catalogs, schedules, any tabular reference data

### Custom Tools

Custom Tools are a powerful way to extend a bot's capabilities with arbitrary logic. Each Custom Tool consists of one or more **Steps** (called **actions** in code and MCP configuration) executed sequentially. Steps can pass data to each other via **variables** — for example, a webhook step can fetch external data and store it in a variable, which the next step then uses in a SQL query to look up a matching row in a Table.

Available step types include (full list and parameters in the MCP tool schema):
- **Webhook** — call an external URL and optionally capture the response
- **Switch bot** — hand off the conversation to another bot
- **Call subordinate bot** — invoke another bot as a sub-agent and return its response
- And more

A Custom Tool can also be configured to accept **arguments** — the bot will extract the required information from the conversation and pass it to the tool as function parameters. Configuration details are in the relevant MCP tool schema.

This makes Custom Tools suitable for complex multi-step workflows, not just simple single-action calls.

### Integrations

Integrations are pre-built connectors available on the Suvvy platform that can be attached to a bot. Unlike Channels (communication surfaces) and Custom Tools (manually configured actions), Integrations are ready-made — once connected, they add tools that let the bot interact with external applications such as CRM systems or booking platforms.

Examples of what integration tools enable:
- Schedule a client appointment
- Look up a client record
- Create or update a CRM entry

When writing a bot's system prompt, treat integration tools the same as custom tools: define an explicit trigger condition for each call.

### Dialogs

A Dialog is the chat session between a bot and a client. When a client writes to a connected channel (Telegram bot, amoCRM, a website widget, etc.), a dialog is created. Client messages arrive in the dialog, the bot responds (calling functions as needed), and its replies are sent back to the client through the channel.

The active bot in a dialog can be switched mid-conversation via a Custom Tool step. After the switch, a different bot takes over in the same dialog — the new bot does not need to have that channel connected.

### Subordinate Bots

A Subordinate Bot is a bot invoked from a Custom Tool step and runs within a single function call. The flow:

1. The active bot in a dialog triggers a Custom Tool
2. A step in that tool calls the Subordinate Bot, passing it relevant information
3. The Subordinate Bot processes the request — calling its own functions, integrations, etc.
4. Its response is returned to the calling bot as the function result

Subordinate Bots are configured exactly like regular bots but have no channel attached. Their instruction should be written as a technical/internal agent prompt. They are useful for delegating specialized tasks and reducing errors by keeping each bot focused on a narrow responsibility.

### Follow-Ups (Scheduled Messages)

A Follow-Up is a message scheduled to be sent to a client at a future time. It is planned automatically at the moment the triggering source is invoked, and fires when the scheduled time arrives.

**Where Follow-Ups are configured:**
- **Custom Tool** — as a dedicated step type inside a Custom Tool
- **FAQ Document** — as a separate setting on the document (not in the text); the follow-up is scheduled the moment the bot retrieves that file
- **Big Document** — same as FAQ Document: a separate setting, scheduled on retrieval

**How it works (FAQ Document example):** A client asks about pricing → the bot retrieves the FAQ Document with prices, reads out the answer → the system simultaneously schedules a follow-up → if the client doesn't reply within the configured time, the follow-up message is sent as a reminder.

**Auto-cancellation:** A follow-up is automatically cancelled if the client sends any message before it fires.

There are multiple follow-up types; full details and parameters are in the MCP tool schema.

### Common Bot Archetypes

Suvvy bots are used in many roles — the platform imposes no restrictions on use case. Common examples:

| Archetype | What the bot does |
|---|---|
| **Support agent** | Answers product questions, resolves issues, escalates to a human |
| **Admin / Receptionist** | Books appointments, checks availability, manages schedules |

Any role that involves text-based client interaction is a valid use case.

## Writing Bot System Prompts

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

**Function calls in prompts (optional but recommended):**

The bot automatically sees all available functions — from integrations, knowledge base, custom tools, etc. — without them being mentioned in the prompt. However, explicitly describing when to call a function gives the bot a clear action plan and reduces ambiguity.

Recommended format when specifying calls:
- FAQ Document: `If the client asks about X, call the get_file_text("Exact Title") function`
- Big Document search: `If the client needs information about X, call the search_in_knowledge_base("query") function`

## Creating FAQ Documents

Each FAQ Document must:
- Have a **short, intent-based title** (2–4 words) reflecting the user's question, not a section label
- Cover **one clear user intent** — never mix topics in a single file
- Be fully **self-contained** — answerable without external context
- Contain only **factual information** — never invent details

| Good Titles | Bad Titles |
|---|---|
| Delivery Time | Information |
| Return Policy | Details |
| Contact Us | FAQ |
| Pricing Plans | Services We Offer |

## Reviewing Existing System Prompts

When auditing a bot's prompt:
1. Check all instructions are non-contradictory and non-duplicated
2. Verify each section contains only appropriate content (no FAQ data in dialogue logic, no instructions in restrictions)
3. Confirm every function call has a trigger condition and uses correct format
4. Move factual/reference data found in the prompt to FAQ Documents
5. Ensure dialogue steps are sequential, one action per step, and logically linked

## Common Mistakes

| Mistake | Fix |
|---|---|
| Factual data (prices, addresses) in system prompt | Move to FAQ Documents |
| Function call without trigger condition | Add "If client asks/does X..." prefix |
| Using Big Documents for short structured answers | Use FAQ Documents instead |
| Multiple intents in one FAQ Document | One file = one intent |
| Generic FAQ Document titles | Use specific intent-based titles (2–4 words) |
| Calling `search_in_knowledge_base` for a known specific file | Use `get_file_text` with the exact title |
