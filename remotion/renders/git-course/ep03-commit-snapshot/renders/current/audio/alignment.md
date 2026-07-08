# EP03 segmented voiceover alignment

EP03 reuses the EP02 BGM at `audio/bgm.mp3`. BGM is mixed at fixed `volume=0.05`; no ducking is used.

Each voice segment is generated separately with MiniMax TTS, using inline pause markers such as `<#0.30#>`. The final aligned voiceover uses the `_norm.mp3` files, normalized with FFmpeg to roughly `-20 LUFS` and limited near `-3 dBFS`.

| Segment | Scene window | Voice starts | Normalized voice duration | Voice ends |
| --- | ---: | ---: | ---: | ---: |
| `01_hook` | 0.0-12.0s | 0.35s | 9.27s | 9.62s |
| `02_from_index` | 12.0-38.0s | 12.35s | 8.98s | 21.33s |
| `03_object_model` | 38.0-74.0s | 38.35s | 13.12s | 51.47s |
| `04_commit_fields` | 74.0-104.0s | 74.35s | 10.60s | 84.95s |
| `05_parent_chain` | 104.0-132.0s | 104.35s | 9.67s | 114.02s |
| `06_hash_identity` | 132.0-158.0s | 132.35s | 9.81s | 142.16s |
| `07_takeaway` | 158.0-180.0s | 158.35s | 9.52s | 167.87s |

Total normalized narration duration is about 72.97s in the 180s main episode. This is intentionally sparse because `object-model`, `parent-chain`, and `hash-identity` are Manim principle scenes that need visual hold time.

Sentence-level timing is available in the sibling `.srt` files. Absolute sentence time is calculated as:

```text
absolute sentence time = Voice starts + cue time in segment .srt
```

The generated `.srt` files were checked after TTS; pause markers such as `<#0.30#>` did not appear in subtitle output.
