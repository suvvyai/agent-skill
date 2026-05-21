# Suvvy MCP — плагин для AI-ассистентов

Интеграция платформы [Suvvy](https://suvvy.ai) с AI-ассистентами. Устанавливает MCP-сервер (`https://api.suvvy.ai/mcp`) и скилл, который учит ассистента создавать и настраивать ботов, базы знаний, каналы и инструменты.

---

## Способы установки

### 1. Claude Plugin (рекомендуется для Claude Code)

Устанавливает MCP-сервер и скилл одной командой.

```
/plugin marketplace add suvvy-ai/agent-skill
/plugin install suvvy-mcp@suvvy-ai/agent-skill
```

После перезапуска Claude Code скилл `suvvy-mcp` появится в списке активных. Для аутентификации спросите ассистента: *«войди в Suvvy»* или вызовите инструмент `authenticate`.

---

### 2. Ручная установка

Добавьте блок конфигурации в нужный файл и перезапустите IDE.

#### Claude Code — уровень проекта

Файл: `.mcp.json` в корне проекта

```json
{
  "suvvy": {
    "type": "http",
    "url": "https://api.suvvy.ai/mcp"
  }
}
```

#### Claude Code — глобально для пользователя

Файл: `~/.claude/settings.json`

```json
{
  "mcpServers": {
    "suvvy": {
      "type": "http",
      "url": "https://api.suvvy.ai/mcp"
    }
  }
}
```

#### Cursor

Файл: `.cursor/mcp.json` в корне проекта

```json
{
  "mcpServers": {
    "suvvy": {
      "url": "https://api.suvvy.ai/mcp"
    }
  }
}
```

#### Windsurf

Файл: `.windsurf/mcp.json` в корне проекта

```json
{
  "mcpServers": {
    "suvvy": {
      "url": "https://api.suvvy.ai/mcp"
    }
  }
}
```

#### Gemini CLI / OpenCode

Добавьте в `gemini-extension.json` в корне проекта:

```json
{
  "mcpServers": {
    "suvvy": {
      "httpUrl": "https://api.suvvy.ai/mcp"
    }
  }
}
```

---

### 3. Установка только скилла (без MCP)

Если нужна только инструкция для Claude (без подключения MCP-сервера):

```
/plugin marketplace add suvvy-ai/llm-skill
/plugin install suvvy-mcp@suvvy-ai/llm-skill
```

Или скопируйте `skills/suvvy-mcp/SKILL.md` в директорию скиллов вашего проекта вручную.

---

## После установки

1. **Перезапустите IDE** — MCP-сервер активируется после перезапуска.
2. **Аутентификация** — спросите ассистента войти в Suvvy или вызовите `authenticate`. Откроется браузер с формой входа.
3. **Готово** — попросите ассистента, например: *«Покажи список моих ботов»* или *«Создай нового бота»*.

---

## Ссылки

- Документация: https://docs.suvvy.ai
- Платформа: https://suvvy.ai
- Поддержка: info@suvvy.ai
