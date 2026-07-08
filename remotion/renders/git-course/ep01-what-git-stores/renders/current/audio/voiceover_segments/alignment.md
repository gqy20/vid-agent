# EP01 segmented voiceover alignment

All offsets are absolute positions in the 180s EP01 timeline. Each segment is generated separately with MiniMax TTS, using inline pause markers such as `<#0.35#>`. The final aligned voiceover uses the `_norm.mp3` files, normalized with FFmpeg to roughly `-20 LUFS` and limited near `-3 dBFS`.

| Segment | Scene window | Voice starts | Voice duration | Voice ends |
| --- | ---: | ---: | ---: | ---: |
| `01_hook` | 0.0-12.0s | 0.2s | 11.376s | 11.576s |
| `02_bad_model` | 12.0-34.0s | 12.9s | 18.324s | 31.224s |
| `03_version_control` | 34.0-64.0s | 34.4s | 29.395s | 63.795s |
| `04_snapshot_model` | 64.0-96.0s | 64.5s | 29.143s | 93.643s |
| `05_local_history` | 96.0-126.0s | 96.5s | 27.560s | 124.060s |
| `06_integrity` | 126.0-156.0s | 126.0s | 29.863s | 155.863s |
| `07_takeaway` | 156.0-180.0s | 156.7s | 21.691s | 178.391s |

2026-07-08 update: scenes `03`-`07` were expanded so the narration follows the mid-scene animation instead of ending early. `03`-`05` use MiniMax TTS `--speed 1.15`, `06` uses `--speed 1.18`, and `07` uses `--speed 1.2`; all were then normalized through FFmpeg loudnorm before alignment.

Sentence-level timing is available in the sibling `.srt` files. Absolute sentence time is calculated as:

```text
absolute sentence time = Voice starts + cue time in segment .srt
```

Example: `02_bad_model.srt` cue 3 is `00:00:06,480 --> 00:00:08,481`, so it lands at `19.380s-21.381s` in the final video.
