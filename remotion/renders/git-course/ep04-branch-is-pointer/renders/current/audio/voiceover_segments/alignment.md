# EP04 Audio Alignment

Episode: `ep04-branch-is-pointer`

TTS settings:

- model: `speech-2.8-hd`
- voice: `Chinese (Mandarin)_Gentleman`
- language: `zh`
- speed: `1.25`

Scene windows:

| Segment | Voice start | Scene end | Normalized file |
|---|---:|---:|---|
| `01_hook` | 0.35s | 12.00s | `01_hook_norm.mp3` |
| `02_mental_model` | 12.35s | 30.00s | `02_mental_model_norm.mp3` |
| `03_terminal` | 30.35s | 48.00s | `03_terminal_norm.mp3` |
| `04_branch_write` | 48.35s | 70.00s | `04_branch_write_norm.mp3` |
| `05_branch_result` | 70.35s | 98.00s | `05_branch_result_norm.mp3` |
| `06_switch` | 98.35s | 122.00s | `06_switch_norm.mp3` |
| `07_commit` | 122.35s | 154.00s | `07_commit_norm.mp3` |
| `08_compare` | 154.35s | 168.00s | `08_compare_norm.mp3` |
| `09_takeaway` | 168.25s | 180.00s | `09_takeaway_norm.mp3` |

Mix strategy:

- Segment voice is generated from one `.txt` file per scene via `remotion/scripts/git-course-build-voiceover.sh`.
- Each segment is normalized with FFmpeg compression and loudness normalization to approximately `-20 LUFS`, peak around `-3 dBFS`.
- BGM is reused from EP03/EP02 at `audio/bgm.mp3`.
- BGM volume is fixed at `0.05`, with no sidechain ducking.
- Aligned narration output: `audio/voiceover-aligned.m4a`.
- Final mix output: `audio/mix.m4a`.

SRT alignment:

- Segment SRT files use the TTS engine timing within each generated segment.
- Global sentence time = `manifest voice_start_seconds + segment_srt_time`.
- Pause markers `<#...#>` must not appear in `.srt` output after generation.
