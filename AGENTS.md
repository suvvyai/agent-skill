# llm-skill — Project Structure

This repo publishes the **suvvy-mcp** skill and plugin for AI coding assistants (Codex, Claude Code, Cursor, Windsurf, Gemini CLI).

## Layout

```
llm-skill/
├── skills/
│   └── suvvy-mcp/
│       └── SKILL.md          ← the skill (single source of truth)
├── plugins/
│   └── suvvy-mcp/
│       ├── package.json      ← npm package (@suvvy/mcp)
│       ├── bin/install.js    ← npx installer (adds MCP server config)
│       ├── .codex-plugin/plugin.json  ← Codex Plugin manifest
│       ├── gemini-extension.json  ← Gemini CLI / OpenCode config
│       ├── README.md         ← installation instructions
│       └── skills/
│           └── suvvy-mcp → ../../../skills/suvvy-mcp  (symlink)
├── .agents/
│   └── plugins/
│       └── marketplace.json  ← Codex Plugin marketplace registration
└── .claude-plugin/
    └── marketplace.json      ← Claude Plugin marketplace registration
```

## What each piece does

**`skills/suvvy-mcp/SKILL.md`** — the skill loaded by Codex/Claude when working with the Suvvy platform. Explains the full platform model (bots, knowledge bases, custom tools, channels, etc.) and correct MCP tool usage. Shared by both the plugin and any standalone skill install. **This is the only file that needs editing when platform features change.**

**`plugins/suvvy-mcp/`** — the npm package `@suvvy/mcp`. Running `npx @suvvy/mcp` adds the Suvvy MCP server URL to the user's MCP config (`.mcp.json` for Claude Code, `.cursor/mcp.json` for Cursor, etc.). Does not contain skill content itself — it symlinks to `skills/suvvy-mcp`.

**`.agents/plugins/marketplace.json`** — registers this repo as a Codex Plugin marketplace. Users can install via `codex plugin marketplace add .` from the repo root, then `codex plugin add suvvy-mcp@suvvy`, which installs both the MCP config and the skill.

**`.claude-plugin/marketplace.json`** — registers this repo as a Claude Plugin on the marketplace. Users can install via `/plugin marketplace add suvvy-ai/llm-skill` then `/plugin install suvvy-mcp@suvvy-ai/llm-skill`, which installs both the MCP config and the skill. The plugin manifest explicitly points to the shared `skills/` directory and `.mcp.json`.

## MCP server

The Suvvy MCP server lives at `https://api.suvvy.ai/mcp` (prod) / `https://test.api.suvvy.ai/mcp` (test). It uses OAuth for authentication. The skill covers all available tools — always check the actual MCP tool schemas for authoritative parameter details.

## Editing the skill

Edit `skills/suvvy-mcp/SKILL.md` only. The plugin symlink means the change is automatically reflected in both distribution paths.

When updating the skill:
- Only document features accessible via MCP tools — not dashboard-only features
- Use exact MCP parameter names (verify against actual tool schemas, not UI labels)
- Keep the Terminology table in sync if new concepts are introduced
