# EP01 segmented voiceover alignment

All offsets are absolute positions in the 180s EP01 timeline. Each segment is generated separately with MiniMax TTS, using inline pause markers such as `<#0.35#>`. The final aligned voiceover uses the `_norm.mp3` files, normalized with FFmpeg to roughly `-20 LUFS` and limited near `-3 dBFS`.

| Segment | Scene window | Voice starts | Voice duration | Voice ends |
| --- | ---: | ---: | ---: | ---: |
| `01_hook` | 0.0-12.0s | 0.2s | 9.883s | 10.083s |
| `02_bad_model` | 12.0-34.0s | 12.9s | 19.495s | 32.395s |
| `03_version_control` | 34.0-64.0s | 34.4s | 28.459s | 62.859s |
| `04_snapshot_model` | 64.0-96.0s | 64.5s | 28.027s | 92.527s |
| `05_local_history` | 96.0-126.0s | 96.5s | 29.107s | 125.607s |
| `06_integrity` | 126.0-156.0s | 126.0s | 29.755s | 155.755s |
| `07_takeaway` | 156.0-180.0s | 156.0s | 19.423s | 175.423s |

2026-07-08 content update: scenes `03`-`07` were expanded so the narration follows the mid-scene animation instead of ending early.

2026-07-08 narration density update: segments `02`-`07` were expanded, then regenerated at speed `1.3` so the narration fills more of each scene without crossing scene windows.

2026-07-08 voice consistency update: all seven segments were regenerated with the same MiniMax voice and speed:

```text
model: speech-2.8-hd
voice: Chinese (Mandarin)_Gentleman
language: zh
speed: 1.3
```

Future EP01 narration updates must reuse these parameters unless the full episode is regenerated with a new voice.

Sentence-level timing is available in the sibling `.srt` files. Absolute sentence time is calculated as:

```text
absolute sentence time = Voice starts + cue time in segment .srt
```

Example: `02_bad_model.srt` cue 3 is `00:00:06,480 --> 00:00:08,481`, so it lands at `19.380s-21.381s` in the final video.
