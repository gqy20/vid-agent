# EP01 segmented voiceover alignment

All offsets are absolute positions in the 180s EP01 timeline. Each segment is generated separately with MiniMax TTS, using inline pause markers such as `<#0.35#>`. The final aligned voiceover uses the `_norm.mp3` files, normalized with FFmpeg to roughly `-20 LUFS` and limited near `-3 dBFS`.

| Segment | Scene window | Voice starts | Voice duration | Voice ends |
| --- | ---: | ---: | ---: | ---: |
| `01_hook` | 0.0-12.0s | 0.2s | 11.376s | 11.576s |
| `02_bad_model` | 12.0-34.0s | 12.9s | 18.324s | 31.224s |
| `03_version_control` | 34.0-64.0s | 34.9s | 15.804s | 50.704s |
| `04_snapshot_model` | 64.0-96.0s | 64.9s | 15.696s | 80.596s |
| `05_local_history` | 96.0-126.0s | 96.9s | 15.156s | 112.056s |
| `06_integrity` | 126.0-156.0s | 126.9s | 12.060s | 138.960s |
| `07_takeaway` | 156.0-180.0s | 156.9s | 12.204s | 169.104s |

Sentence-level timing is available in the sibling `.srt` files. Absolute sentence time is calculated as:

```text
absolute sentence time = Voice starts + cue time in segment .srt
```

Example: `02_bad_model.srt` cue 3 is `00:00:06,480 --> 00:00:08,481`, so it lands at `19.380s-21.381s` in the final video.
