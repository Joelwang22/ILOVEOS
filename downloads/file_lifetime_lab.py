"""Compare file-handle lifetime and flush frequency with equivalent records."""

import argparse
import os
import time
from pathlib import Path


def record(index):
    return f"{index:06d}|ILOVEOS controlled log record\n"


def keep_open(path, count):
    with path.open("w", encoding="utf-8", newline="") as stream:
        for index in range(count):
            stream.write(record(index))


def reopen(path, count):
    path.write_text("", encoding="utf-8")
    for index in range(count):
        with path.open("a", encoding="utf-8", newline="") as stream:
            stream.write(record(index))


def flush_each(path, count):
    with path.open("w", encoding="utf-8", newline="") as stream:
        for index in range(count):
            stream.write(record(index))
            stream.flush()
            os.fsync(stream.fileno())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("keep-open", "reopen", "flush"))
    parser.add_argument("--records", type=int, default=250)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.records <= 0:
        parser.error("--records must be positive")

    path = (args.output or Path(f"iloveos_{args.mode}.log")).resolve()
    runners = {"keep-open": keep_open, "reopen": reopen, "flush": flush_each}
    print(f"PID: {os.getpid()}")
    print(f"mode: {args.mode}")
    print(f"path: {path}")
    input("Start the filtered Process Monitor capture, then press Enter...")
    started = time.perf_counter()
    runners[args.mode](path, args.records)
    elapsed_ms = (time.perf_counter() - started) * 1000
    print(f"records: {args.records}")
    print(f"bytes: {path.stat().st_size}")
    print(f"elapsed: {elapsed_ms:.3f} ms")


if __name__ == "__main__":
    main()
