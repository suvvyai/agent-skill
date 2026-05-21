#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// MCP server entry for project-level .mcp.json (Claude Code format)
const SUVVY_MCP_ENTRY = {
  type: 'http',
  url: 'https://api.suvvy.ai/mcp',
};

// MCP server entry for Cursor / Windsurf (mcpServers wrapper + plain url)
const SUVVY_URL_ENTRY = {
  url: 'https://api.suvvy.ai/mcp',
};

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function patchFile(filePath, patchFn) {
  const before = readJson(filePath);
  const after = patchFn(before);
  if (after !== null) writeJson(filePath, after);
}

const args = new Set(process.argv.slice(2));
const helpRequested = args.has('--help') || args.has('-h');

if (helpRequested) {
  console.log(`
Usage: npx @suvvy/mcp [options]

Options:
  (no flags)     Add to .mcp.json in current directory (Claude Code)
  --global       Add to ~/.claude/settings.json (Claude Code, all projects)
  --cursor       Add to .cursor/mcp.json in current directory (Cursor)
  --windsurf     Add to .windsurf/mcp.json in current directory (Windsurf)
  --all          Add to all of the above
  --help         Show this help

Examples:
  npx @suvvy/mcp                 # Claude Code project config
  npx @suvvy/mcp --global        # Claude Code user config
  npx @suvvy/mcp --cursor        # Cursor
  npx @suvvy/mcp --all           # All IDEs at once
`);
  process.exit(0);
}

const installAll = args.has('--all');
const installGlobal = args.has('--global') || installAll;
const installCursor = args.has('--cursor') || installAll;
const installWindsurf = args.has('--windsurf') || installAll;
// Default: Claude Code project-level if no specific flag
const installClaudeProject =
  args.has('--claude') || installAll || (!installGlobal && !installCursor && !installWindsurf);

console.log('Installing Suvvy MCP server...\n');

// ── Claude Code: project-level .mcp.json ─────────────────────────────────────
if (installClaudeProject) {
  const target = path.join(process.cwd(), '.mcp.json');
  patchFile(target, (cfg) => {
    if (cfg.suvvy) {
      console.log(`  (skipped) ${target} — suvvy already present`);
      return null;
    }
    console.log(`  + ${target}  (Claude Code)`);
    return { ...cfg, suvvy: SUVVY_MCP_ENTRY };
  });
}

// ── Claude Code: global user settings ────────────────────────────────────────
if (installGlobal) {
  const target = path.join(os.homedir(), '.claude', 'settings.json');
  patchFile(target, (cfg) => {
    const servers = cfg.mcpServers ?? {};
    if (servers.suvvy) {
      console.log(`  (skipped) ${target} — suvvy already present`);
      return null;
    }
    console.log(`  + ${target}  (Claude Code global)`);
    return { ...cfg, mcpServers: { ...servers, suvvy: SUVVY_MCP_ENTRY } };
  });
}

// ── Cursor ────────────────────────────────────────────────────────────────────
if (installCursor) {
  const target = path.join(process.cwd(), '.cursor', 'mcp.json');
  patchFile(target, (cfg) => {
    const servers = cfg.mcpServers ?? {};
    if (servers.suvvy) {
      console.log(`  (skipped) ${target} — suvvy already present`);
      return null;
    }
    console.log(`  + ${target}  (Cursor)`);
    return { ...cfg, mcpServers: { ...servers, suvvy: SUVVY_URL_ENTRY } };
  });
}

// ── Windsurf ──────────────────────────────────────────────────────────────────
if (installWindsurf) {
  const target = path.join(process.cwd(), '.windsurf', 'mcp.json');
  patchFile(target, (cfg) => {
    const servers = cfg.mcpServers ?? {};
    if (servers.suvvy) {
      console.log(`  (skipped) ${target} — suvvy already present`);
      return null;
    }
    console.log(`  + ${target}  (Windsurf)`);
    return { ...cfg, mcpServers: { ...servers, suvvy: SUVVY_URL_ENTRY } };
  });
}

console.log('\nDone! Restart your IDE to activate the Suvvy MCP server.');
console.log('\nNext: authenticate by running mcp__suvvy__authenticate in your AI assistant.');
console.log('Docs: https://docs.suvvy.ai');
