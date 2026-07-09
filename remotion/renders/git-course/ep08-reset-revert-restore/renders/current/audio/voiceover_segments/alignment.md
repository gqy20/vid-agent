# EP08 Audio Alignment

Episode: `ep08-reset-revert-restore`

TTS settings:

- model: `speech-2.8-hd`
- voice: `Chinese (Mandarin)_Gentleman`
- language: `zh`
- speed: `1.25`

Scene windows:

| Segment | Voice start | Scene end | Normalized file |
|---|---:|---:|---|
| `01_hook` | 0.35s | 12.00s | `01_hook_norm.mp3` |
| `02_three_trees` | 12.35s | 40.00s | `02_three_trees_norm.mp3` |
| `03_reset_modes` | 40.35s | 86.00s | `03_reset_modes_norm.mp3` |
| `04_revert` | 86.35s | 116.00s | `04_revert_norm.mp3` |
| `05_restore` | 116.35s | 146.00s | `05_restore_norm.mp3` |
| `06_choose` | 146.35s | 168.00s | `06_choose_norm.mp3` |
| `07_takeaway` | 168.25s | 180.00s | `07_takeaway_norm.mp3` |

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
