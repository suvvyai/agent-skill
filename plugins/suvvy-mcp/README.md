# Suvvy MCP

Suvvy bot platform integration for AI assistants — manage bots, knowledge bases, channels, and custom tools via the [Suvvy MCP server](https://docs.suvvy.ai).

## Installation

### Option 1 — Claude Plugin (recommended for Claude Code)

Install as a Claude Plugin with the bundled skill:

```
/plugin marketplace add suvvy-ai/llm-skill
/plugin install suvvy-mcp@suvvy-ai/llm-skill
```

This installs both the MCP server config and the `suvvy-mcp` skill that teaches Claude how to use the platform.

---

### Option 2 — NPX (any project, any IDE)

Run the installer from your project root:

```bash
# Claude Code (project-level .mcp.json)
npx @suvvy/mcp

# Claude Code (user-level, all projects)
npx @suvvy/mcp --global

# Cursor
npx @suvvy/mcp --cursor

# Windsurf
npx @suvvy/mcp --windsurf

# All IDEs at once
npx @suvvy/mcp --all
```

---

### Option 3 — Manual

Add the following entry to your MCP config file:

**Claude Code** (`.mcp.json` in project root):
```json
{
  "suvvy": {
    "type": "http",
    "url": "https://api.suvvy.ai/mcp"
  }
}
```

**Cursor** (`.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "suvvy": {
      "url": "https://api.suvvy.ai/mcp"
    }
  }
}
```

**Windsurf** (`.windsurf/mcp.json`):
```json
{
  "mcpServers": {
    "suvvy": {
      "url": "https://api.suvvy.ai/mcp"
    }
  }
}
```

**Gemini CLI / OpenCode** — copy `gemini-extension.json` from this directory to your project.

---

### Option 4 — Anthropic Agent Skills marketplace

Add the `suvvy-mcp` skill standalone (without the MCP, skill-only):

```
/plugin marketplace add suvvy-ai/llm-skill
/plugin install suvvy-mcp@suvvy-ai/llm-skill
```

---

## After Installation

1. Restart your IDE to activate the MCP server
2. Authenticate: ask your AI assistant to call `authenticate` (it will open a browser login)
3. Start managing your bots

## Documentation

Full platform docs: https://docs.suvvy.ai
