# EP01 segmented voiceover alignment

All offsets are absolute positions in the 180s EP01 timeline. Each segment is generated separately with MiniMax TTS, using inline pause markers such as `<#0.35#>`. The final aligned voiceover uses the `_norm.mp3` files, normalized with FFmpeg to roughly `-20 LUFS` and limited near `-3 dBFS`.

| Segment | Scene window | Voice starts | Voice duration | Voice ends |
| --- | ---: | ---: | ---: | ---: |
| `01_hook` | 0.0-12.0s | 0.2s | 10.955s | 11.155s |
| `02_bad_model` | 12.0-34.0s | 12.9s | 15.386s | 28.286s |
| `03_version_control` | 34.0-64.0s | 34.4s | 27.450s | 61.850s |
| `04_snapshot_model` | 64.0-96.0s | 64.5s | 25.260s | 89.760s |
| `05_local_history` | 96.0-126.0s | 96.5s | 25.004s | 121.504s |
| `06_integrity` | 126.0-156.0s | 126.0s | 26.912s | 152.912s |
| `07_takeaway` | 156.0-180.0s | 156.7s | 21.187s | 177.887s |

2026-07-08 content update: scenes `03`-`07` were expanded so the narration follows the mid-scene animation instead of ending early.

2026-07-08 voice consistency update: all seven segments were regenerated with the same MiniMax voice and speed:

```text
model: speech-2.8-hd
voice: Chinese (Mandarin)_Gentleman
language: zh
speed: 1.15
```

Future EP01 narration updates must reuse these parameters unless the full episode is regenerated with a new voice.

Sentence-level timing is available in the sibling `.srt` files. Absolute sentence time is calculated as:

```text
absolute sentence time = Voice starts + cue time in segment .srt
```

Example: `02_bad_model.srt` cue 3 is `00:00:06,480 --> 00:00:08,481`, so it lands at `19.380s-21.381s` in the final video.
