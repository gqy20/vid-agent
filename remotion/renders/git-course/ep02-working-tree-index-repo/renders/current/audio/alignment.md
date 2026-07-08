# EP02 segmented voiceover alignment

EP02 reuses the EP01 BGM at `audio/bgm.mp3`. BGM is mixed at fixed `volume=0.05`; no ducking is used.

Each voice segment is generated separately with MiniMax TTS, using inline pause markers such as `<#0.25#>`. The final aligned voiceover uses the `_norm.mp3` files, normalized with FFmpeg to roughly `-20 LUFS` and limited near `-3 dBFS`.

| Segment | Scene window | Voice starts | Normalized voice duration | Voice ends |
| --- | ---: | ---: | ---: | ---: |
| `01_hook` | 0.0-12.0s | 0.3s | 11.25s | 11.55s |
| `02_three-areas` | 12.0-38.0s | 12.9s | 20.07s | 32.97s |
| `03_modify` | 38.0-68.0s | 38.9s | 12.87s | 51.77s |
| `04_add` | 68.0-104.0s | 68.9s | 16.90s | 85.80s |
| `05_edit-after-add` | 104.0-134.0s | 104.9s | 17.62s | 122.52s |
| `06_commit` | 134.0-164.0s | 134.9s | 16.62s | 151.52s |
| `07_takeaway` | 164.0-180.0s | 164.6s | 13.23s | 177.83s |

Sentence-level timing is available in the sibling `.srt` files. Absolute sentence time is calculated as:

```text
absolute sentence time = Voice starts + cue time in segment .srt
```
