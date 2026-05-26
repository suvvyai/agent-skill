# Voice Agent

Suvvy supports a **Voice Agent** mode for phone call interactions. The bot receives audio, converts speech to text (STT), processes the conversation, and responds via synthesized speech (TTS). Cost: ~30 rubles per minute.

**Setup:** Configure in the **Голос** tab of the Instruction screen. Requires a phone number, a SIP address (obtained from Suvvy support), and configuration with a telephony provider.

**Writing instructions for voice:** use short sentences, avoid markdown formatting, avoid bullet lists and headers — the bot will speak the text verbatim. When voice mode is enabled, the platform automatically adapts the instruction style section for audio delivery.

## STT Settings (`voice_settings.stt_model`)

- `name` — STT model: `"openai/gpt-4o-transcribe"`, `"deepgram/nova-2"`, `"deepgram/nova-3"`, `"elevenlabs/scribe_v2_realtime"`, `"deepgram/flux-general-en"`
- `language` — `"ru"`, `"en"`, or `"multi"` for multilingual recognition
- `keywords` — list of domain-specific keywords to improve recognition accuracy

## VAD Settings (`voice_settings.vad`)

Voice activity detection:
- `activation_threshold` (0–1) — sensitivity threshold for detecting speech
- `min_speech_duration` (0–2 sec) — minimum audio duration to register as speech
- `min_silence_duration` (0–2 sec) — silence duration that marks end of a phrase

## TTS Settings (`voice_settings.tts_model`)

- `name` — TTS model: `"eleven_flash_v2_5"` or `"eleven_turbo_v2_5"`
- `voice_id` — ElevenLabs voice ID
- `speed` (0.25–4) — speech rate
- `stability` (0–1) — consistency vs. expressiveness balance
- `style` (0–1) — liveliness/expressiveness level
- `similarity_boost` (0–1) — closeness to the reference voice sample

## Call Settings

- Welcome message played at call start
- Background audio (ambient sound, adjustable volume) — options: `city_ambience`, `forest_ambience`, `office_ambience`, `crowded_room`
- `user_away_finish_call_seconds` (30–300) — auto-hangup after this many seconds of client silence
- `max_call_duration_minutes` (5–30) — maximum call length
- **Silence response** (`silence_response`): when the client is silent for `timeout_seconds` (3–60), the bot proactively says one of the configured `phrase_list` strings and runs the `instruction` to decide what to do next. Use to prompt idle callers ("Are you still there?").
