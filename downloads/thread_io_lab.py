"""Measure a controlled directory read with a chosen Python thread count."""

import argparse
import os
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path


def read_file(path):
    total = 0
    with path.open("rb") as stream:
        while chunk := stream.read(256 * 1024):
            total += len(chunk)
    return total


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("path", type=Path, help="controlled directory to read")
    parser.add_argument("workers", type=int)
    parser.add_argument("--pause", action="store_true", help="pause before timing for Process Monitor")
    args = parser.parse_args()
    if not 1 <= args.workers <= 256:
        parser.error("workers must be between 1 and 256")
    root = args.path.resolve()
    if not root.is_dir():
        parser.error("path must be an existing directory")
    files = sorted(path for path in root.rglob("*") if path.is_file())
    if not files:
        parser.error("the directory contains no files")

    print(f"PID: {os.getpid()}")
    print(f"main native TID: {threading.get_native_id()}")
    print(f"root: {root}")
    print(f"files: {len(files)}")
    print(f"workers: {args.workers}")
    if args.pause:
        input("Start the filtered Process Monitor capture, then press Enter...")

    started = time.perf_counter()
    with ThreadPoolExecutor(max_workers=args.workers, thread_name_prefix="ILOVEOS-io") as executor:
        sizes = list(executor.map(read_file, files))
    elapsed_ms = (time.perf_counter() - started) * 1000
    print(f"bytes read: {sum(sizes)}")
    print(f"elapsed: {elapsed_ms:.3f} ms")


if __name__ == "__main__":
    main()
