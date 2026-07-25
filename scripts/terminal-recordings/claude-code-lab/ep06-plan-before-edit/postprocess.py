#!/usr/bin/env python3
"""EP06 has no intentional on-screen secret after the cast leak check."""

import argparse
from pathlib import Path
import shutil

parser = argparse.ArgumentParser()
parser.add_argument("--cast", required=True)
parser.add_argument("--input", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--secret-length", required=True)
parser.add_argument("--idle-time-limit", required=True)
args = parser.parse_args()

if not Path(args.cast).is_file():
    raise SystemExit("cast is missing")
shutil.copyfile(args.input, args.output)
