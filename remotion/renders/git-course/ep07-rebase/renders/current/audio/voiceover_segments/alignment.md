# EP07 Audio Alignment

Episode: `ep07-rebase`

TTS settings:

- model: `speech-2.8-hd`
- voice: `Chinese (Mandarin)_Gentleman`
- language: `zh`
- speed: `1.25`

Scene windows:

| Segment | Voice start | Scene end | Normalized file |
|---|---:|---:|---|
| `01_hook` | 0.35s | 12.00s | `01_hook_norm.mp3` |
| `02_compare_merge` | 12.35s | 38.00s | `02_compare_merge_norm.mp3` |
| `03_replay_model` | 38.35s | 82.00s | `03_replay_model_norm.mp3` |
| `04_new_identity` | 82.35s | 112.00s | `04_new_identity_norm.mp3` |
| `05_fast_forward_after` | 112.35s | 138.00s | `05_fast_forward_after_norm.mp3` |
| `06_public_risk` | 138.35s | 166.00s | `06_public_risk_norm.mp3` |
| `07_takeaway` | 166.25s | 180.00s | `07_takeaway_norm.mp3` |

Mix strategy:

- Segment voice is generated from one `.txt` file per scene via `remotion/scripts/git-course-build-voiceover.sh`.
- Each segment is normalized with FFmpeg compression and loudness normalization to approximately `-20 LUFS`, peak around `-3 dBFS`.
- BGM is reused from EP04 at `audio/bgm.mp3`.
- BGM volume is fixed at `0.05`, with no sidechain ducking.
- Aligned narration output: `audio/voiceover-aligned.m4a`.
- Final mix output: `audio/mix.m4a`.

SRT alignment:

- Segment SRT files use the TTS engine timing within each generated segment.
- Global sentence time = `manifest voice_start_seconds + segment_srt_time`.
- SRT files were checked after generation; pause markers `<#...#>` did not appear in `.srt` output.
