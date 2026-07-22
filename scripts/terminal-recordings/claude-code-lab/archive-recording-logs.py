#!/usr/bin/env python3
"""Archive one Claude Code recording run without publishing conversation content."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


SAFE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
CREDENTIAL_PATTERNS = (
    re.compile(rb"Authorization\s*[:=]\s*Bearer\s+[^\s\"']+", re.IGNORECASE),
    re.compile(rb"\bsk-(?:ant-)?[A-Za-z0-9._-]{12,}"),
    re.compile(rb"(?:API_KEY|AUTH_TOKEN|SECRET_KEY|PASSWORD)\s*[:=]\s*[^\s\"']{8,}", re.IGNORECASE),
)
PRIVATE_KEY_PATTERN = re.compile(rb"BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY")
EMAIL_PATTERN = re.compile(rb"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.IGNORECASE)
HOST_HOME_PATTERN = re.compile(rb"/home/(?!cc(?:/|\b))[^/\s\"']+")
CONTAINER_PATH_PATTERN = re.compile(rb"/(?:home/cc|workspace)(?:/|\b)")


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def validate_id(value: str, label: str) -> None:
    if not SAFE_ID.fullmatch(value):
        raise ValueError(f"invalid {label}: {value!r}")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    path.chmod(0o600)


def copy_file(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    shutil.copyfile(source, target)
    target.chmod(0o600)


def copy_tree_files(source: Path, target: Path) -> None:
    if not source.is_dir():
        return
    for path in sorted(source.rglob("*")):
        if not path.is_file() or path.is_symlink():
            continue
        relative = path.relative_to(source)
        copy_file(path, target / relative)


def iter_files(root: Path) -> Iterable[Path]:
    return (path for path in sorted(root.rglob("*")) if path.is_file() and not path.is_symlink())


def parse_timestamp(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def safe_label(value: Any, *, maximum: int = 80) -> str | None:
    if not isinstance(value, str) or not value:
        return None
    if len(value) > maximum or any(ord(char) < 32 for char in value):
        return None
    return value


def collect_tool_names(value: Any) -> list[str]:
    names: set[str] = set()

    def visit(node: Any) -> None:
        if isinstance(node, list):
            for child in node:
                visit(child)
            return
        if not isinstance(node, dict):
            return
        if node.get("type") == "tool_use":
            name = safe_label(node.get("name"), maximum=64)
            if name and SAFE_ID.fullmatch(name):
                names.add(name)
        for child in node.values():
            visit(child)

    visit(value)
    return sorted(names)


def json_kind(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    return "number"


def safe_object_keys(value: Any) -> list[str]:
    if not isinstance(value, dict):
        return []
    return sorted(
        key
        for key in value
        if isinstance(key, str) and len(key) <= 64 and SAFE_ID.fullmatch(key)
    )


def message_blocks(event: dict[str, Any]) -> list[dict[str, Any]]:
    message = event.get("message")
    if not isinstance(message, dict):
        return []
    content = message.get("content")
    if not isinstance(content, list):
        return []
    return [block for block in content if isinstance(block, dict)]


def session_trace_rows(session_paths: list[Path]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    parsed: list[tuple[datetime | None, int, dict[str, Any]]] = []
    sequence = 0
    for path in session_paths:
        with path.open("r", encoding="utf-8", errors="replace") as source:
            for line in source:
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if not isinstance(event, dict):
                    continue
                parsed.append((parse_timestamp(event.get("timestamp")), sequence, event))
                sequence += 1

    timestamps = [timestamp for timestamp, _, _ in parsed if timestamp is not None]
    origin = min(timestamps) if timestamps else None
    uuid_sequences: dict[str, int] = {}
    message_ordinals: dict[str, int] = {}
    tool_ordinals: dict[str, int] = {}
    for _, index, event in parsed:
        uuid = event.get("uuid")
        if isinstance(uuid, str) and uuid:
            uuid_sequences[uuid] = index
        message = event.get("message")
        if isinstance(message, dict):
            message_id = message.get("id")
            if isinstance(message_id, str) and message_id and message_id not in message_ordinals:
                message_ordinals[message_id] = len(message_ordinals) + 1
        for block in message_blocks(event):
            if block.get("type") != "tool_use":
                continue
            tool_id = block.get("id")
            if isinstance(tool_id, str) and tool_id and tool_id not in tool_ordinals:
                tool_ordinals[tool_id] = len(tool_ordinals) + 1

    rows: list[dict[str, Any]] = []
    for timestamp, index, event in parsed:
        row: dict[str, Any] = {
            "schemaVersion": 1,
            "source": "claude-session",
            "sequence": index,
            "type": safe_label(event.get("type")) or "unknown",
        }
        subtype = safe_label(event.get("subtype"))
        if subtype:
            row["subtype"] = subtype
        parent_uuid = event.get("parentUuid")
        if isinstance(parent_uuid, str) and parent_uuid in uuid_sequences:
            row["parentSequence"] = uuid_sequences[parent_uuid]
        message = event.get("message")
        if isinstance(message, dict):
            role = safe_label(message.get("role"), maximum=32)
            if role:
                row["role"] = role
            message_id = message.get("id")
            if isinstance(message_id, str) and message_id in message_ordinals:
                row["messageOrdinal"] = message_ordinals[message_id]
            content = message.get("content")
            if isinstance(content, str):
                row["contentTypes"] = ["text"]
            elif isinstance(content, list):
                content_types = []
                for block in content:
                    if not isinstance(block, dict):
                        continue
                    block_type = safe_label(block.get("type"), maximum=32)
                    if block_type and SAFE_ID.fullmatch(block_type) and block_type not in content_types:
                        content_types.append(block_type)
                if content_types:
                    row["contentTypes"] = content_types
        tool_names = collect_tool_names(event)
        if tool_names:
            row["toolNames"] = tool_names
        tool_calls = []
        tool_results = []
        for block in message_blocks(event):
            block_type = block.get("type")
            if block_type == "tool_use":
                tool_id = block.get("id")
                name = safe_label(block.get("name"), maximum=64)
                if not isinstance(tool_id, str) or tool_id not in tool_ordinals or not name or not SAFE_ID.fullmatch(name):
                    continue
                tool_calls.append(
                    {
                        "ordinal": tool_ordinals[tool_id],
                        "name": name,
                        "inputKeys": safe_object_keys(block.get("input")),
                    }
                )
            elif block_type == "tool_result":
                tool_id = block.get("tool_use_id")
                if not isinstance(tool_id, str) or tool_id not in tool_ordinals:
                    continue
                tool_results.append(
                    {
                        "ordinal": tool_ordinals[tool_id],
                        "isError": bool(block.get("is_error", False)),
                        "contentType": json_kind(block.get("content")),
                    }
                )
        if tool_calls:
            row["toolCalls"] = tool_calls
        if tool_results:
            row["toolResults"] = tool_results
        if event.get("type") == "file-history-snapshot":
            snapshot = event.get("snapshot")
            backups = snapshot.get("trackedFileBackups") if isinstance(snapshot, dict) else None
            row["checkpoint"] = {
                "kind": "snapshot",
                "trackedFileCount": len(backups) if isinstance(backups, (dict, list)) else 0,
            }
        elif event.get("type") == "file-history-delta":
            row["checkpoint"] = {
                "kind": "delta",
                "hasBackup": isinstance(event.get("backup"), dict),
            }
        if event.get("type") == "system" and subtype == "turn_duration":
            duration = event.get("durationMs")
            message_count = event.get("messageCount")
            row["turn"] = {}
            if isinstance(duration, (int, float)) and duration >= 0:
                row["turn"]["durationMs"] = round(float(duration), 3)
            if isinstance(message_count, int) and message_count >= 0:
                row["turn"]["messageCount"] = message_count
            if not row["turn"]:
                del row["turn"]
        if timestamp is not None and origin is not None:
            row["relativeSeconds"] = round((timestamp - origin).total_seconds(), 3)
        rows.append(row)

    linked_events = [event for _, _, event in parsed if isinstance(event.get("uuid"), str)]
    parents = [event.get("parentUuid") for event in linked_events if isinstance(event.get("parentUuid"), str)]
    child_counts: dict[str, int] = {}
    for parent in parents:
        child_counts[parent] = child_counts.get(parent, 0) + 1
    assistant_entries = [event for _, _, event in parsed if event.get("type") == "assistant"]
    assistant_message_ids = {
        message.get("id")
        for event in assistant_entries
        if isinstance((message := event.get("message")), dict) and isinstance(message.get("id"), str)
    }
    calls = [call for row in rows for call in row.get("toolCalls", [])]
    results = [result for row in rows for result in row.get("toolResults", [])]
    result_ordinals = {result["ordinal"] for result in results}
    snapshots = [row for row in rows if row.get("checkpoint", {}).get("kind") == "snapshot"]
    architecture = {
        "schemaVersion": 1,
        "source": "claude-session-derived",
        "events": {"session": len(rows), "director": 0},
        "chain": {
            "linkedNodes": len(linked_events),
            "resolvedParents": sum(1 for parent in parents if parent in uuid_sequences),
            "rootNodes": sum(1 for event in linked_events if not isinstance(event.get("parentUuid"), str)),
            "branchingParents": sum(1 for count in child_counts.values() if count > 1),
            "maxChildren": max(child_counts.values(), default=0),
        },
        "messages": {
            "assistantEntries": len(assistant_entries),
            "assistantMessages": len(assistant_message_ids),
            "userEntries": sum(1 for _, _, event in parsed if event.get("type") == "user"),
        },
        "tools": {
            "calls": len(calls),
            "results": len(results),
            "paired": sum(1 for call in calls if call["ordinal"] in result_ordinals),
            "errors": sum(1 for result in results if result["isError"]),
            "sequence": [call["name"] for call in calls],
        },
        "checkpoints": {
            "snapshots": len(snapshots),
            "deltas": sum(1 for row in rows if row.get("checkpoint", {}).get("kind") == "delta"),
            "maxTrackedFiles": max(
                (row["checkpoint"]["trackedFileCount"] for row in snapshots),
                default=0,
            ),
        },
        "privacy": {
            "excluded": [
                "message content",
                "tool input values",
                "tool result content",
                "raw identifiers",
                "paths",
            ]
        },
    }
    return rows, architecture


def director_trace_rows(events_path: Path | None, start_sequence: int) -> list[dict[str, Any]]:
    if events_path is None or not events_path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    with events_path.open("r", encoding="utf-8", errors="replace") as source:
        for line in source:
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(event, dict):
                continue
            row: dict[str, Any] = {
                "schemaVersion": 1,
                "source": "director-event",
                "sequence": start_sequence + len(rows),
            }
            for source_key, target_key in (
                ("phase", "phase"),
                ("segmentId", "segmentId"),
                ("kind", "kind"),
                ("label", "label"),
            ):
                value = safe_label(event.get(source_key))
                if value:
                    row[target_key] = value
            elapsed = event.get("rawElapsedSeconds")
            if isinstance(elapsed, (int, float)) and elapsed >= 0:
                row["relativeSeconds"] = round(float(elapsed), 3)
            edit = event.get("edit")
            if isinstance(edit, dict):
                mode = safe_label(edit.get("mode"), maximum=32)
                if mode:
                    row["editMode"] = mode
            rows.append(row)
    return rows


def write_trace(raw_root: Path, output: Path, architecture_output: Path) -> tuple[int, dict[str, Any]]:
    session_paths = [path for path in iter_files(raw_root / "projects") if path.suffix == ".jsonl"]
    rows, architecture = session_trace_rows(session_paths)
    director_rows = director_trace_rows(raw_root / "director" / "events.jsonl", len(rows))
    rows.extend(director_rows)
    architecture["events"]["director"] = len(director_rows)
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    with output.open("w", encoding="utf-8") as target:
        for row in rows:
            target.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
    output.chmod(0o600)
    write_json(architecture_output, architecture)
    return len(rows), architecture


def scan_files(paths: list[Path], secrets: list[str], scanned_root: Path, now: str) -> dict[str, Any]:
    findings = {
        "configuredSecret": 0,
        "credentialPattern": 0,
        "privateKey": 0,
        "email": 0,
        "hostHomePath": 0,
        "containerAbsolutePath": 0,
    }
    affected: dict[str, set[str]] = {key: set() for key in findings}
    secret_bytes = [secret.encode() for secret in secrets if len(secret) >= 8]
    for path in paths:
        data = path.read_bytes()
        relative = path.relative_to(scanned_root).as_posix()
        for secret in secret_bytes:
            count = data.count(secret)
            if count:
                findings["configuredSecret"] += count
                affected["configuredSecret"].add(relative)
        for pattern in CREDENTIAL_PATTERNS:
            matches = pattern.findall(data)
            if matches:
                findings["credentialPattern"] += len(matches)
                affected["credentialPattern"].add(relative)
        for key, pattern in (
            ("privateKey", PRIVATE_KEY_PATTERN),
            ("email", EMAIL_PATTERN),
            ("hostHomePath", HOST_HOME_PATTERN),
            ("containerAbsolutePath", CONTAINER_PATH_PATTERN),
        ):
            matches = pattern.findall(data)
            if matches:
                findings[key] += len(matches)
                affected[key].add(relative)

    blocking = findings["configuredSecret"] + findings["credentialPattern"] + findings["privateKey"]
    warnings = findings["email"] + findings["hostHomePath"]
    verdict = "fail" if blocking else "warn" if warnings else "pass"
    return {
        "schemaVersion": 1,
        "scannedAt": now,
        "verdict": verdict,
        "policy": {
            "blocking": ["configuredSecret", "credentialPattern", "privateKey"],
            "warning": ["email", "hostHomePath"],
            "informational": ["containerAbsolutePath"],
        },
        "findings": findings,
        "affectedFiles": {key: sorted(value) for key, value in affected.items() if value},
    }


def normalized_version(path: Path | None) -> str | None:
    if path is None or not path.is_file():
        return None
    first_line = path.read_text(encoding="utf-8", errors="replace").splitlines()
    value = first_line[0].strip() if first_line else ""
    if not value or len(value) > 128 or any(ord(char) < 32 for char in value):
        return None
    return value


def secure_permissions(root: Path) -> None:
    root.chmod(0o700)
    for path in root.rglob("*"):
        path.chmod(0o700 if path.is_dir() else 0o600)


def archive_recording_logs(
    *,
    episode_id: str,
    run_id: str,
    exit_code: int,
    mode: str,
    claude_home: Path,
    director_log: Path | None,
    events: Path | None,
    version_file: Path | None,
    output_dir: Path,
    image: dict[str, str],
    secrets: list[str],
    now: str | None = None,
) -> dict[str, Any]:
    validate_id(episode_id, "episode id")
    validate_id(run_id, "run id")
    if mode not in {"install", "run"}:
        raise ValueError(f"invalid recording mode: {mode!r}")
    if output_dir.exists():
        raise FileExistsError(f"recording archive already exists: {output_dir}")

    timestamp = now or utc_now()
    output_dir.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    staging = output_dir.with_name(f".{output_dir.name}.tmp-{os.getpid()}")
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(mode=0o700)
    try:
        raw = staging / "raw"
        raw.mkdir(mode=0o700)
        copy_tree_files(claude_home / "projects", raw / "projects")
        copy_tree_files(claude_home / "debug", raw / "debug")
        if director_log is not None and director_log.is_file():
            copy_file(director_log, raw / "director" / "run.log")
        if events is not None and events.is_file():
            copy_file(events, raw / "director" / "events.jsonl")

        trace = staging / "sanitized" / "session-trace.jsonl"
        architecture_path = staging / "sanitized" / "session-architecture.json"
        trace_entries, architecture = write_trace(raw, trace, architecture_path)

        raw_files = list(iter_files(raw))
        audit = scan_files(raw_files, secrets, staging, timestamp)
        audit_path = staging / "audit" / "sensitive-scan.json"
        audit_path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        write_json(audit_path, audit)

        files = []
        for path in iter_files(staging):
            files.append(
                {
                    "path": path.relative_to(staging).as_posix(),
                    "bytes": path.stat().st_size,
                    "sha256": sha256(path),
                }
            )
        manifest: dict[str, Any] = {
            "schemaVersion": 1,
            "episodeId": episode_id,
            "runId": run_id,
            "status": "succeeded" if exit_code == 0 else "failed",
            "exitCode": exit_code,
            "mode": mode,
            "archivedAt": timestamp,
            "claudeCodeVersion": normalized_version(version_file),
            "containerImage": image,
            "traceEntries": trace_entries,
            "sessionArchitecture": {
                "path": "sanitized/session-architecture.json",
                "sessionEvents": architecture["events"]["session"],
                "toolCalls": architecture["tools"]["calls"],
                "toolResults": architecture["tools"]["results"],
                "checkpoints": architecture["checkpoints"]["snapshots"],
            },
            "sensitiveScan": {
                "verdict": audit["verdict"],
                "path": "audit/sensitive-scan.json",
            },
            "files": files,
        }
        write_json(staging / "manifest.json", manifest)
        secure_permissions(staging)
        staging.rename(output_dir)
        secure_permissions(output_dir)
        return manifest
    except BaseException:
        if staging.exists():
            shutil.rmtree(staging)
        raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--episode-id", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--exit-code", required=True, type=int)
    parser.add_argument("--mode", required=True, choices=("install", "run"))
    parser.add_argument("--claude-home", required=True, type=Path)
    parser.add_argument("--director-log", required=True, type=Path)
    parser.add_argument("--events", required=True, type=Path)
    parser.add_argument("--version-file", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--image-tag", required=True)
    parser.add_argument("--image-id", required=True)
    parser.add_argument("--image-fingerprint", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    manifest = archive_recording_logs(
        episode_id=args.episode_id,
        run_id=args.run_id,
        exit_code=args.exit_code,
        mode=args.mode,
        claude_home=args.claude_home,
        director_log=args.director_log,
        events=args.events,
        version_file=args.version_file,
        output_dir=args.output_dir,
        image={
            "tag": args.image_tag,
            "id": args.image_id,
            "buildFingerprint": args.image_fingerprint,
        },
        secrets=[os.environ.get("CC_RECORDING_SECRET", "")],
    )
    print(f"recording logs: {args.output_dir}", file=sys.stderr)
    print(f"sensitive scan: {manifest['sensitiveScan']['verdict']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
