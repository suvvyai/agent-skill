# Voice Agent

Suvvy supports a **Voice Agent** mode for phone call interactions. The bot receives audio, converts speech to text (STT), processes the conversation, and responds via synthesized speech (TTS).

**Setup:** Configure in the **Голос** tab of the Instruction screen. Requires a phone number, a SIP address (obtained from Suvvy support), and configuration with a telephony provider — telephony itself is set up in the dashboard.

**Turning voice mode on/off:**
- `enable_instance_voice_mode` — switches an existing bot to voice mode: voice settings come from the voice template, the bot's model is switched to a voice-capable one, and a greeting is generated. A bot that is already in voice mode is left unchanged. The instruction is **not** rewritten for voice unless you pass `update_instruction: true`.
- `disable_instance_voice_mode` — switches the bot back to text mode; its voice settings are deleted.
- To create a new voice bot from scratch, call `create_instance` with `template_code: "voice"`.

All voice settings tools below work only for a bot in voice mode.

**Writing instructions for voice:** use short sentences, avoid markdown formatting, avoid bullet lists and headers — the bot will speak the text verbatim.

## Three settings tools — know which one to call

Voice settings are split across three MCP tools with distinct purposes. Fields are **not interchangeable between them**:

| Tool | Covers |
|---|---|
| `update_instance_voice_settings` | `start_message`, `start_message_instruction`, `ai_disclaimer`, `say_first_on_outbound`, `outbound_calls_only_in_work_hours`, `background_audio`, `silence_response` |
| `update_instance_voice_extra_settings` | `stt_model`, `tts_model`, `vad`, `interruption`, `filler`, `user_away_finish_call_seconds`, `max_call_duration_minutes` |
| `update_instance_voice_language` | `language` only — see below, has special auto-select behavior |

Both settings tools take the changes in a `body` object: pass only the fields you change. `update_instance_voice_extra_settings` and `reset_instance_voice_filler` require a plan that allows advanced bot settings (otherwise `USER_ACTION_FORBIDDEN`); `update_instance_voice_settings` and `update_instance_voice_language` have no such gate.

## Changing the Language (`update_instance_voice_language`)

Pass just `language` (a code from `get_voice_agent_language_list`). The language is changed, and the tool **automatically** tries to pick a matching STT model, TTS voice and TTS model for it — only as a complete set: if no complete set exists for the language, the models and voice stay as they were. A language with no available voices at all is rejected. Don't hand-pick a model/voice combo when switching languages.

## STT / TTS Models — always fetch the current catalog first

Model and voice identifiers (`stt_model.name`, `tts_model.name`, `tts_model.voice_id`) reference a live catalog that can change without a skill update. Before setting any of them, call:
- `get_voice_agent_stt_model_list` — available STT models
- `get_voice_agent_tts_model_list` — available TTS models (each has a `provider_type`)
- `get_voice_agent_tts_voice_list` — available TTS voices; **requires `provider_type`** (from the TTS model list), optionally `tts_model_id` to list only voices compatible with that model
- `get_voice_agent_language_list` — available languages

## STT Settings (`update_instance_voice_extra_settings`, field `stt_model`)

- `name` (required) — STT model identifier, from `get_voice_agent_stt_model_list`
- `keywords` — list of domain-specific keywords to improve recognition accuracy

## VAD Settings (field `vad`)

Voice activity detection. **All three fields are required** — take the current values from `get_instance` and change only what you need:
- `activation_threshold` (0–1) — sensitivity threshold for detecting speech
- `min_speech_duration` (0–2 sec) — minimum audio duration to register as speech
- `min_silence_duration` (0–2 sec) — silence duration that marks end of a phrase

## Interruption Settings (field `interruption`)

Controls when the client can interrupt the bot mid-speech. **Both fields are required** (current values from `get_instance`):
- `min_duration` (0–5 sec) — minimum duration of client speech required to interrupt the bot
- `min_words` (0–5) — minimum number of words required to interrupt the bot

## TTS Settings (field `tts_model`)

**Required fields — pass all of them even if you only change the voice** (current values from `get_instance`): `name`, `voice_id`, `speed`, `stability`, `style`, `similarity_boost`.

- `name` — TTS model identifier, from `get_voice_agent_tts_model_list`
- `voice_id` — voice identifier, from `get_voice_agent_tts_voice_list`
- `speed` (0.6–3) — speech rate; rounded to the steps the model supports
- `stability` (0–1) — consistency vs. expressiveness balance
- `style` (0–1) — liveliness/expressiveness level
- `similarity_boost` (0–1) — closeness to the reference voice sample
- `speech_style` (optional) — `professional`, `warmly`, `lively`, `neutral`, `support`, `casual`, `sales`, `formal`, `narrator`
- `style_preset` (optional) — `strict_business`, `warm_caring`, `energetic_sales`, `thoughtful_expert`, `casual_friendly`; which presets a model supports is listed in the TTS model catalog
- `accent_stress` (default `true`) — automatic stress marks for pronunciation
- `chunk_length_schedule` — advanced streaming-chunk tuning; leave at defaults unless diagnosing latency issues

A style or preset the chosen model doesn't support is reset. If the bot has an answer style applied (ElevenLabs model with tags and a supported language), `speech_style` and `style_preset` don't affect the speech.

## Filler (field `filler`)

Short "thinking" phrases played while the bot prepares its real response. The object replaces the previous one entirely; `null` disables fillers.
- `is_enabled` — fillers on/off
- `categories` — up to 10 named categories: `{"<category name>": {"phrases": [...], "description": "...", "is_enabled": true}}`; each category has 1–5 phrases (up to 25 characters each)
- `context_enabled` / `context_prompt` — pick fillers based on the conversation context

Enabling fillers without categories fills in the TTS model's default categories. `reset_instance_voice_filler` resets the categories to the TTS model's defaults.

## Call Settings

Split across two tools depending on the field:
- **`update_instance_voice_settings`**:
  - `start_message` / `start_message_instruction` — welcome message at call start: fixed text, or an instruction to generate it (if the instruction is set, the greeting is generated from it). Both are templates — see `references/writing-prompts.md`.
  - `ai_disclaimer` — phrase telling the caller they are talking to an AI, played before the greeting; `null` removes it.
  - `say_first_on_outbound` — on outbound calls the bot speaks first.
  - `outbound_calls_only_in_work_hours` — outbound calls (CRM trigger, external API, call campaign, Custom Tool) only during the bot's working hours.
  - `background_audio` — `{ambient_sound, volume}` (volume 0–1), replaces the previous value; sounds: `city_ambience`, `forest_ambience`, `office_ambience`, `crowded_room`, `it_office_ambience`, `office_ambience_soft`, `office_printer_ambience`; `null` removes it.
  - `silence_response` — when the client is silent for `timeout_seconds` (3–60), the bot says one of the `phrase_list` strings (or follows `instruction`) and decides what to do next. Both `phrase_list` and `instruction` keys are required (one of them may be `null`); `loop_phrase_list` repeats the phrase list instead of stopping after one pass.
- **`update_instance_voice_extra_settings`**: `user_away_finish_call_seconds` (10–300, auto-hangup after this many seconds of client silence), `max_call_duration_minutes` (5–30).
