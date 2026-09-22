# Voice Agent

Suvvy supports a **Voice Agent** mode for phone call interactions. The bot receives audio, converts speech to text (STT), processes the conversation, and responds via synthesized speech (TTS).

**Setup:** Configure in the **Голос** tab of the Instruction screen. Requires a phone number, a SIP address (obtained from Suvvy support), and configuration with a telephony provider. Toggle voice mode itself via `enable_instance_voice_mode` / `disable_instance_voice_mode`.

**Writing instructions for voice:** use short sentences, avoid markdown formatting, avoid bullet lists and headers — the bot will speak the text verbatim. When voice mode is enabled, the platform automatically adapts the instruction style section for audio delivery.

## Three different settings tools — know which one to call

Voice settings are split across three MCP tools with distinct purposes. Fields are **not interchangeable between them**:

| Tool | Covers |
|---|---|
| `update_instance_voice_settings` | `start_message`, `start_message_instruction`, `say_first_on_outbound`, `background_audio`, `silence_response` |
| `update_instance_voice_extra_settings` | `stt_model`, `tts_model`, `vad`, `interruption`, `filler` (admin-only), `user_away_finish_call_seconds`, `max_call_duration_minutes` |
| `update_instance_voice_language` | `language` only — see below, has special auto-select behavior |

## Changing the Language (`update_instance_voice_language`)

Pass just `language`. The tool **automatically** picks a matching STT model, TTS voice, and TTS model for that language — you do not (and should not) try to hand-pick a model/voice combo yourself when switching languages. If no complete model+voice combo exists for the requested language, the call is rejected and nothing changes. This tool has no subscription-tier gate (available on all plans), unlike the two `/settings` tools above.

## STT / TTS Models — always fetch the current catalog first

Model and voice identifiers (`stt_model.name`, `tts_model.name`, `tts_model.voice_id`) are **not** a fixed hardcoded list — they reference a live catalog that can change without a skill update. Before setting any of them, call:
- `get_voice_agent_stt_model_list` — available STT models
- `get_voice_agent_tts_model_list` — available TTS models
- `get_voice_agent_tts_voice_list` — available TTS voices
- `get_voice_agent_language_list` — available languages

## STT Settings (`update_instance_voice_extra_settings`, field `stt_model`)

- `name` — STT model identifier, from `get_voice_agent_stt_model_list`
- `keywords` — list of domain-specific keywords to improve recognition accuracy

## VAD Settings (`update_instance_voice_extra_settings`, field `vad`)

Voice activity detection:
- `activation_threshold` (0–1) — sensitivity threshold for detecting speech
- `min_speech_duration` (0–2 sec) — minimum audio duration to register as speech
- `min_silence_duration` (0–2 sec) — silence duration that marks end of a phrase

## Interruption Settings (`update_instance_voice_extra_settings`, field `interruption`)

Controls when the client can interrupt the bot mid-speech:
- `min_duration` (0–5 sec) — minimum duration of client speech required to interrupt the bot
- `min_words` (0–5) — minimum number of words required to interrupt the bot

## TTS Settings (`update_instance_voice_extra_settings`, field `tts_model`)

- `name` — TTS model identifier, from `get_voice_agent_tts_model_list`
- `voice_id` — voice identifier, from `get_voice_agent_tts_voice_list`
- `speed` (0.6–3) — speech rate
- `stability` (0–1) — consistency vs. expressiveness balance
- `style` (0–1) — liveliness/expressiveness level
- `similarity_boost` (0–1) — closeness to the reference voice sample
- `chunk_length_schedule` — advanced streaming-chunk tuning; leave at defaults unless diagnosing latency issues

## Filler (`update_instance_voice_extra_settings`, field `filler`) — admin only

Short "thinking" phrases played while the bot prepares its real response. **Setting this field requires admin role** — a non-admin request that includes it is rejected. Fields: `second_filler_wait`, `context_enabled`, `context_prompt`, `phrases`.

## Call Settings

Split across two tools depending on the field:
- **`update_instance_voice_settings`**: `start_message` / `start_message_instruction` (welcome message played at call start — either fixed text or an LLM-generation instruction), `say_first_on_outbound`, `background_audio` (ambient sound, adjustable volume — options: `city_ambience`, `forest_ambience`, `office_ambience`, `crowded_room`), **Silence response** (`silence_response`): when the client is silent for `timeout_seconds` (3–60), the bot proactively says one of the configured `phrase_list` strings (or follows `instruction`) and decides what to do next — at least one of `phrase_list`/`instruction` is required; `loop_phrase_list` repeats the phrase list instead of stopping after one pass.
- **`update_instance_voice_extra_settings`**: `user_away_finish_call_seconds` (30–300, auto-hangup after this many seconds of client silence), `max_call_duration_minutes` (maximum call length).
