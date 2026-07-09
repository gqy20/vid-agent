# EP01 segmented voiceover alignment

All offsets are absolute positions in the 210s EP01 timeline. Each segment is generated separately with MiniMax TTS, using inline pause markers such as `<#0.35#>`. The final aligned voiceover uses the `_norm.mp3` files, normalized with FFmpeg to roughly `-20 LUFS` and limited near `-3 dBFS`.

| Segment | Scene window | Voice starts | Voice duration | Voice ends | Blank after |
| --- | ---: | ---: | ---: | ---: | ---: |
| `01_hook` | 0.0-12.0s | 0.2s | 8.659s | 8.859s | 3.141s |
| `02_bad_model` | 12.0-34.0s | 12.5s | 19.819s | 32.319s | 1.681s |
| `03_version_control` | 34.0-64.0s | 33.6s | 30.331s | 63.931s | 0.069s |
| `04_snapshot_model` | 64.0-96.0s | 64.0s | 31.519s | 95.519s | 0.481s |
| `05_practice_check` | 96.0-126.0s | 95.6s | 24.499s | 120.099s | 5.901s |
| `05_local_history` | 126.0-156.0s | 126.5s | 25.543s | 152.043s | 3.957s |
| `06_integrity` | 156.0-186.0s | 156.0s | 27.487s | 183.487s | 2.513s |
| `07_takeaway` | 186.0-210.0s | 186.0s | 20.935s | 206.935s | 3.065s |

2026-07-08 practice update: EP01 now includes an extra `05_practice_check` segment from 96s to 126s. The narration uses `git log --oneline`, `git show --stat HEAD`, and `git show --name-only HEAD` as minimal practice, without introducing staging, branches, or HEAD internals.

2026-07-08 BGM update: the main mix is 210s. `bgm_180.mp3` is reused as the course BGM source, but the build script loops it to `EPISODE_DURATION` before mixing so the BGM remains present for the full episode.

2026-07-08 content update: scenes `03`-`07` were expanded so the narration follows the mid-scene animation instead of ending early.

2026-07-08 narration density update: segments `02`-`07` were expanded, then regenerated at speed `1.3` so the narration fills more of each scene without crossing scene windows.

2026-07-08 comfort pacing update: all seven segments were regenerated at speed `1.25`. Segment `03` and `04` now start at the scene boundary, and segment `05` was shortened so the narration follows the local-history visual beats without crowding the scene end.

2026-07-08 sentence pacing update: segment `01` was rewritten so the core question lands while the title is still visible; segment `03` was tightened to reduce repeated wording; segment `05` now reads `.git` as "点 git" for clearer spoken comprehension. Segment `02` now starts at `12.5s` to absorb normal TTS duration variance.

2026-07-08 voice consistency update: all seven segments were regenerated with the same MiniMax voice and speed:

```text
model: speech-2.8-hd
voice: Chinese (Mandarin)_Gentleman
language: zh
speed: 1.25
```

Future EP01 narration updates must reuse these parameters unless the full episode is regenerated with a new voice.

2026-07-09 pacing update: concept-boundary pauses were added after the `project-final-2` list, the version-control summary, the snapshot stream handoff, the practice `git log` proof, the hash fingerprint analogy, and the takeaway first sentence. Segment `02`, `05_practice_check`, and `06_integrity` wording was tightened so the regenerated voice stays inside scene windows. `03_version_control` now starts at `33.6s`; `05_practice_check` now starts at `95.6s` to avoid overlap with the regenerated snapshot-model voice. `.srt` files were checked: pause markers did not leak, and two MiniMax subtitle encoding truncations were repaired in local SRT text.

Sentence-level timing is available in the sibling `.srt` files. Absolute sentence time is calculated as:

```text
absolute sentence time = Voice starts + cue time in segment .srt
```

Example: `02_bad_model.srt` cue 3 is `00:00:05,256 --> 00:00:06,793`, so it lands at `17.756s-19.293s` in the final video.
