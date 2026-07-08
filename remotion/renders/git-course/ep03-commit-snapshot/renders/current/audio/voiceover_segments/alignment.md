# EP03 Audio Alignment

Episode: `ep03-commit-snapshot`

TTS settings:

- model: `speech-2.8-hd`
- voice: `Chinese (Mandarin)_Gentleman`
- language: `zh`
- speed: `1.25`

Scene windows:

| Segment | Voice start | Scene end | Normalized file |
|---|---:|---:|---|
| `01_hook` | 0.35s | 12.00s | `01_hook_norm.mp3` |
| `02_from_index` | 12.35s | 38.00s | `02_from_index_norm.mp3` |
| `03_object_model` | 38.35s | 74.00s | `03_object_model_norm.mp3` |
| `04_commit_fields` | 74.35s | 104.00s | `04_commit_fields_norm.mp3` |
| `05_parent_chain` | 104.35s | 132.00s | `05_parent_chain_norm.mp3` |
| `06_hash_identity` | 132.35s | 158.00s | `06_hash_identity_norm.mp3` |
| `07_takeaway` | 158.35s | 180.00s | `07_takeaway_norm.mp3` |

Mix strategy:

- Segment voice was generated from one `.txt` file per scene via `remotion/scripts/git-course-build-voiceover.sh`.
- Each segment was normalized with FFmpeg compression and loudness normalization to approximately `-20 LUFS`, peak around `-3 dBFS`.
- BGM is reused from EP02: `audio/bgm.mp3`.
- BGM volume is fixed at `0.05`, with no sidechain ducking.
- Aligned narration output: `audio/voiceover-aligned.m4a`.
- Final mix output: `audio/mix.m4a`.

SRT alignment:

- Segment SRT files use the TTS engine timing within each generated segment.
- Global sentence time = `manifest voice_start_seconds + segment_srt_time`.
- Pause markers `<#...#>` were checked after generation and did not appear in `.srt` output.
